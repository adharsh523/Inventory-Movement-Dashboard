

import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = { IN: '#10b981', OUT: '#ef4444' };

/**
 * @param {{ movements: Array }} props
 */
export default function InOutPieChart({ movements }) {
  const totals = movements.reduce(
    (acc, m) => {
      if (m.movementType === 'IN')  acc.IN  += m.quantity;
      if (m.movementType === 'OUT') acc.OUT += m.quantity;
      return acc;
    },
    { IN: 0, OUT: 0 }
  );

  const data = [
    { name: 'IN',  value: totals.IN  },
    { name: 'OUT', value: totals.OUT },
  ].filter(d => d.value > 0);

  const total = totals.IN + totals.OUT;

  if (data.length === 0) {
    return (
      <div style={emptyStyle}>No data for pie chart</div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 16, justifyContent: 'center' }}>
        {[
          { label: 'Total IN',  value: totals.IN,  color: '#10b981' },
          { label: 'Total OUT', value: totals.OUT, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{
            textAlign: 'center',
            padding: '10px 20px',
            background: '#0a0f1e',
            border: `1px solid ${s.color}33`,
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 11, color: '#475569', fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Syne', sans-serif" }}>
              {s.value.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: '#334155', fontFamily: "'Space Mono', monospace" }}>
              {total > 0 ? ((s.value / total) * 100).toFixed(1) : 0}%
            </div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name]}
                stroke={COLORS[entry.name]}
                strokeWidth={0}
                fillOpacity={0.85}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#0d1526',
              border: '1px solid #1e2d4a',
              borderRadius: 8,
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              color: '#e2e8f0',
            }}
            formatter={(value, name) => [value.toLocaleString(), name]}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#94a3b8', fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

const emptyStyle = {
  height: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#334155',
  fontFamily: "'Space Mono', monospace",
  fontSize: 13,
};
