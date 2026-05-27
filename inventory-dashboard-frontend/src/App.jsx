

import React, { useState, useEffect, useCallback } from 'react';
import FileUploader   from './components/FileUploader';
import FiltersPanel   from './components/FiltersPanel';
import MovementsTable from './components/MovementsTable';
import InOutPieChart  from './components/InOutPieChart';
import TimeSeriesChart from './components/TimeSeriesChart';
import { fetchMovements, fetchWarehouses } from './utils/api';
import './App.css';


function defaultFilters() {
  const today = new Date();
  const from  = new Date(today);
  from.setMonth(from.getMonth() - 3);
  const fmt = d => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(today), type: 'ALL', warehouse: 'ALL' };
}


export default function App() {
  const [dataReady, setDataReady]       = useState(false);
  const [movements, setMovements]       = useState([]);
  const [warehouses, setWarehouses]     = useState([]);
  const [filters, setFilters]           = useState(defaultFilters());
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [uploadPanelOpen, setUploadPanelOpen] = useState(true);



  useEffect(() => {
    fetchWarehouses().then(setWarehouses).catch(() => {});
  }, []);


  const applyFilters = useCallback(async () => {
    if (!dataReady) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchMovements(filters);
      setMovements(data);
    } catch (err) {
      setError(`Failed to fetch movements: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filters, dataReady]);


  useEffect(() => {
    if (dataReady) applyFilters();
  }, [dataReady]);


  const onUploadSuccess = useCallback(async (uploadedMovements) => {
    setDataReady(true);
    setUploadPanelOpen(false);

    fetchWarehouses().then(setWarehouses).catch(() => {});
    setLoading(true);
    setError('');
    try {
      const data = await fetchMovements(filters);
      setMovements(data);
    } catch {
      setMovements(uploadedMovements);
    } finally {
      setLoading(false);
    }
  }, [filters]);


  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div>
            <div className="header-eyebrow">INVENTORY CONTROL</div>
            <h1 className="header-title">Movement Dashboard</h1>
          </div>
          <div className="header-status">
            <div className={`status-dot ${dataReady ? 'status-active' : 'status-idle'}`} />
            <span>{dataReady ? 'LIVE DATA' : 'AWAITING UPLOAD'}</span>
          </div>
        </div>
      </header>

      <main className="app-main">

        <section className="card">
          <div
            className="card-header collapsible"
            onClick={() => setUploadPanelOpen(o => !o)}
          >
            <div className="section-label">📤 JSON UPLOAD & SHA-256 VERIFICATION</div>
            <span className="collapse-toggle">{uploadPanelOpen ? '▲' : '▼'}</span>
          </div>
          {uploadPanelOpen && (
            <div style={{ padding: '0 0 4px' }}>
              <p className="upload-hint">
                Select a <code>.json</code> movements file. The browser computes its SHA-256 digest,
                which the backend re-verifies before accepting the data.
              </p>
              <FileUploader onSuccess={onUploadSuccess} />
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <div className="section-label">🔍 FILTERS</div>
          </div>
          <FiltersPanel
            filters={filters}
            warehouses={warehouses}
            onFilterChange={setFilters}
            onApply={applyFilters}
            loading={loading}
          />
        </section>

        {error && (
          <div className="error-banner">⚠️ {error}</div>
        )}

        {dataReady && (
          <div className="charts-grid">
            <section className="card">
              <div className="card-header">
                <div className="section-label">🥧 IN vs OUT — QUANTITY SPLIT</div>
              </div>
              <InOutPieChart movements={movements} />
            </section>

            <section className="card">
              <div className="card-header">
                <div className="section-label">📈 DAILY MOVEMENTS — TIME SERIES</div>
              </div>
              <TimeSeriesChart movements={movements} />
            </section>
          </div>
        )}

        {dataReady && (
          <section className="card">
            <div className="card-header">
              <div className="section-label">📋 STOCK MOVEMENTS</div>
              <div style={{ fontSize: 11, color: '#334155' }}>
                {movements.length.toLocaleString()} records
              </div>
            </div>
            <MovementsTable movements={movements} loading={loading} />
          </section>
        )}
        {!dataReady && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-title">No data loaded</div>
            <div className="empty-body">
              Upload a JSON movements file above to begin. The SHA-256 digest
              will be computed in your browser and verified by the backend before data is shown.
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
