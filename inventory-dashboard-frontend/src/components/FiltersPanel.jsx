
import React from 'react';

/**
 * @param {{
 *   filters: { from: string, to: string, type: string, warehouse: string },
 *   warehouses: string[],
 *   onFilterChange: (filters) => void,
 *   onApply: () => void,
 *   loading: boolean,
 * }} props
 */
export default function FiltersPanel({ filters, warehouses, onFilterChange, onApply, loading }) {
  const update = (key, value) => onFilterChange({ ...filters, [key]: value });

  return (
    <div style={{
      background: '#0d1526',
      border: '1px solid #1e2d4a',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 16,
      alignItems: 'flex-end',
    }}>

      <FilterField label="FROM">
        <DateInput
          value={filters.from}
          onChange={v => update('from', v)}
        />
      </FilterField>

      <FilterField label="TO">
        <DateInput
          value={filters.to}
          onChange={v => update('to', v)}
        />
      </FilterField>

      <FilterField label="TYPE">
        <SelectInput
          value={filters.type}
          onChange={v => update('type', v)}
          options={[
            { value: 'ALL', label: 'All' },
            { value: 'IN',  label: 'IN' },
            { value: 'OUT', label: 'OUT' },
          ]}
        />
      </FilterField>

      <FilterField label="WAREHOUSE">
        <SelectInput
          value={filters.warehouse}
          onChange={v => update('warehouse', v)}
          options={[
            { value: 'ALL', label: 'All Warehouses' },
            ...warehouses.map(w => ({ value: w, label: w })),
          ]}
        />
      </FilterField>

      <button
        onClick={onApply}
        disabled={loading || !filters.from || !filters.to}
        style={{
          padding: '10px 24px',
          background: loading ? '#1e3a5f' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
          border: 'none',
          borderRadius: 8,
          color: loading ? '#64748b' : '#fff',
          cursor: loading || !filters.from || !filters.to ? 'not-allowed' : 'pointer',
          fontFamily: "'Space Mono', monospace",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          transition: 'all 0.2s',
          alignSelf: 'flex-end',
          marginBottom: 1,
        }}
      >
        {loading ? 'LOADING…' : 'APPLY FILTERS'}
      </button>

      {(!filters.from || !filters.to) && (
        <div style={{ fontSize: 11, color: '#ef4444', alignSelf: 'flex-end', marginBottom: 6 }}>
          Date range is required
        </div>
      )}
    </div>
  );
}



function FilterField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 10,
        letterSpacing: 2,
        color: '#475569',
        fontFamily: "'Space Mono', monospace",
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function DateInput({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={inputStyle}
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={inputStyle}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

const inputStyle = {
  padding: '9px 12px',
  background: '#0a0f1e',
  border: '1px solid #1e2d4a',
  borderRadius: 8,
  color: '#e2e8f0',
  fontFamily: "'Space Mono', monospace",
  fontSize: 13,
  outline: 'none',
  minWidth: 140,
  colorScheme: 'dark',
};
