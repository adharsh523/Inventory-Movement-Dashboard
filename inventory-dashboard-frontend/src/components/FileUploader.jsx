/**
 * FileUploader.jsx
 * Drag-and-drop / click-to-upload panel.
 * - Computes SHA-256 in the browser via Web Crypto API
 * - POSTs file + digest to POST /api/verify-file
 * - Reports validation state (pending / valid / invalid / error)
 */

import React, { useState, useRef, useCallback } from 'react';
import { computeSHA256 } from '../utils/sha256';
import { verifyAndUploadFile } from '../utils/api';

// Validation states
const STATUS = {
  IDLE:      'idle',
  HASHING:   'hashing',
  UPLOADING: 'uploading',
  VALID:     'valid',
  INVALID:   'invalid',
  ERROR:     'error',
};

/**
 * @param {{ onSuccess: (movements: Array) => void }} props
 */
export default function FileUploader({ onSuccess }) {
  const [status, setStatus]     = useState(STATUS.IDLE);
  const [message, setMessage]   = useState('');
  const [sha256, setSha256]     = useState('');
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);


  const handleFile = useCallback(async (file) => {
    if (!file || !file.name.endsWith('.json')) {
      setStatus(STATUS.ERROR);
      setMessage('Please select a valid .json file.');
      return;
    }

    setFileName(file.name);
    setStatus(STATUS.HASHING);
    setMessage('Computing SHA-256 digest…');

    try {
      const digest = await computeSHA256(file);
      setSha256(digest);
      setMessage('Uploading and verifying with backend…');
      setStatus(STATUS.UPLOADING);

      const result = await verifyAndUploadFile(file, digest);

      if (result.valid) {
        setStatus(STATUS.VALID);
        setMessage(`✓ Verified! ${result.count?.toLocaleString() ?? ''} records loaded.`);
        onSuccess(result.movements || []);
      } else {
        setStatus(STATUS.INVALID);
        setMessage(result.message || 'SHA-256 mismatch — file may be corrupted.');
      }
    } catch (err) {
      setStatus(STATUS.ERROR);
      setMessage(`Error: ${err.message}`);
    }
  }, [onSuccess]);


  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);


  const statusColors = {
    [STATUS.IDLE]:      { border: '#2a3a5e', bg: '#0d1526' },
    [STATUS.HASHING]:   { border: '#f59e0b', bg: '#1c1408' },
    [STATUS.UPLOADING]: { border: '#3b82f6', bg: '#0a1626' },
    [STATUS.VALID]:     { border: '#10b981', bg: '#041a10' },
    [STATUS.INVALID]:   { border: '#ef4444', bg: '#1a0404' },
    [STATUS.ERROR]:     { border: '#ef4444', bg: '#1a0404' },
  };

  const colors = statusColors[status];
  const isLoading = status === STATUS.HASHING || status === STATUS.UPLOADING;

  return (
    <div style={{ fontFamily: "'Space Mono', monospace" }}>
      {/* Drop zone */}
      <div
        onClick={() => !isLoading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          border: `2px dashed ${dragging ? '#60a5fa' : colors.border}`,
          borderRadius: 12,
          background: dragging ? '#0a1f3a' : colors.bg,
          padding: '32px 24px',
          textAlign: 'center',
          cursor: isLoading ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isLoading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Spinner />
          </div>
        )}

        <div style={{ fontSize: 36, marginBottom: 12 }}>
          {status === STATUS.VALID   ? '✅' :
           status === STATUS.INVALID ? '❌' :
           status === STATUS.ERROR   ? '⚠️' : '📂'}
        </div>

        <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
          {status === STATUS.IDLE
            ? <>Drag & drop a <strong style={{ color: '#60a5fa' }}>.json</strong> movements file here,<br />or click to browse</>
            : <span style={{ color: status === STATUS.VALID ? '#34d399' : status === STATUS.INVALID || status === STATUS.ERROR ? '#f87171' : '#fbbf24' }}>
                {message}
              </span>
          }
        </div>

        {fileName && (
          <div style={{ marginTop: 10, fontSize: 11, color: '#475569' }}>
            {fileName}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {sha256 && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          background: '#0a0f1e',
          borderRadius: 8,
          border: '1px solid #1e2d4a',
        }}>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, letterSpacing: 1 }}>
            SHA-256 DIGEST (computed in browser)
          </div>
          <div style={{
            fontSize: 11,
            color: '#64748b',
            wordBreak: 'break-all',
            fontFamily: "'Space Mono', monospace",
          }}>
            {sha256}
          </div>
        </div>
      )}

      {(status === STATUS.VALID || status === STATUS.INVALID || status === STATUS.ERROR) && (
        <button
          onClick={() => {
            setStatus(STATUS.IDLE);
            setMessage('');
            setSha256('');
            setFileName('');
            if (inputRef.current) inputRef.current.value = '';
          }}
          style={{
            marginTop: 12,
            padding: '8px 18px',
            background: 'transparent',
            border: '1px solid #2a3a5e',
            borderRadius: 8,
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          Upload another file
        </button>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 32, height: 32,
      border: '3px solid #1e3a5f',
      borderTop: '3px solid #60a5fa',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}
