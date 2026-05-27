

import React, { useState, useEffect } from 'react';

const PAGE_SIZE = 10;

const TYPE_BADGE = {
  IN:  { bg: '#042f1a', color: '#34d399', border: '#065f46' },
  OUT: { bg: '#2d0a0a', color: '#f87171', border: '#7f1d1d' },
};

/**
 * @param {{ movements: Array, loading: boolean }} props
 */
export default function MovementsTable({ movements, loading }) {
  const [page, setPage] = useState(1);


  useEffect(() => { setPage(1); }, [movements]);

  const totalPages = Math.max(1, Math.ceil(movements.length / PAGE_SIZE));
  const start      = (page - 1) * PAGE_SIZE;
  const pageData   = movements.slice(start, start + PAGE_SIZE);

  return (
    <div>
      {/* Header row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 12, color: '#475569', fontFamily: "'Space Mono', monospace" }}>
          {movements.length.toLocaleString()} records &nbsp;·&nbsp; page {page} of {totalPages}
        </div>
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => Math.min(totalPages, p + 1))}
        />
      </div>

      {/* Table */}
      <div style={{
        border: '1px solid #1e2d4a',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#0d1526',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Space Mono', monospace" }}>
          <thead>
            <tr style={{ background: '#0a0f1e', borderBottom: '1px solid #1e2d4a' }}>
              {['DATE / TIME', 'ID', 'SKU', 'TYPE', 'QTY', 'WAREHOUSE'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#475569', padding: 40 }}>
                  Loading…
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#475569', padding: 40 }}>
                  No records found for selected filters.
                </td>
              </tr>
            ) : pageData.map((m, i) => {
              const badge = TYPE_BADGE[m.movementType] || TYPE_BADGE.IN;
              const date  = new Date(m.timestamp);
              return (
                <tr
                  key={m.id}
                  style={{
                    borderBottom: i < pageData.length - 1 ? '1px solid #0f1e35' : 'none',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#111d30'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                >
                  <td style={tdStyle}>
                    <span style={{ color: '#94a3b8' }}>{date.toLocaleDateString('en-GB')}</span>
                    <span style={{ color: '#334155', marginLeft: 6, fontSize: 11 }}>
                      {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#334155', fontSize: 11 }}>{m.id}</td>
                  <td style={{ ...tdStyle, color: '#60a5fa', fontWeight: 700 }}>{m.sku}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      letterSpacing: 1,
                    }}>
                      {m.movementType}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#e2e8f0', fontWeight: 700 }}>
                    {m.quantity.toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, color: '#64748b', fontSize: 11 }}>
                    {m.warehouse || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
          />
        </div>
      )}
    </div>
  );
}


function PaginationControls({ page, totalPages, onPrev, onNext }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <PageBtn onClick={onPrev} disabled={page === 1}>← Prev</PageBtn>
      <span style={{ fontSize: 12, color: '#475569', fontFamily: "'Space Mono', monospace" }}>
        {page} / {totalPages}
      </span>
      <PageBtn onClick={onNext} disabled={page === totalPages}>Next →</PageBtn>
    </div>
  );
}

function PageBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 14px',
        background: 'transparent',
        border: `1px solid ${disabled ? '#1a2440' : '#2a3a5e'}`,
        borderRadius: 6,
        color: disabled ? '#1e2d4a' : '#94a3b8',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Space Mono', monospace",
        fontSize: 12,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}


const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: 10,
  letterSpacing: 2,
  color: '#475569',
  fontWeight: 700,
};

const tdStyle = {
  padding: '11px 16px',
  fontSize: 13,
  color: '#94a3b8',
  verticalAlign: 'middle',
};
