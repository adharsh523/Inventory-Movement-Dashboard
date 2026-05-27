

import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/**
 * @param {{ movements: Array }} props
 */
export default function TimeSeriesChart({ movements }) {
  const chartData = useMemo(() => {
    const byDate = {};
    for (const m of movements) {
      const date = m.timestamp.substring(0, 10); // "YYYY-MM-DD"
      if (!byDate[date]) byDate[date] = { date, IN: 0, OUT: 0 };
      byDate[date][m.movementType] = (byDate[date][m.movementType] || 0) + m.quantity;
    }
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [movements]);

  if (chartData.length === 0) {
    return (
      <div style={{
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#334155',
        fontFamily: "'Space Mono', monospace",
        fontSize: 13,
      }}>
        No data for time-series chart
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };


  const tickInterval = chartData.length > 60 ? Math.floor(chartData.length / 20) : 0;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIN" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="colorOUT" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke="#0f1e35" strokeDasharray="4 4" vertical={false} />

        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          interval={tickInterval}
          tick={{ fill: '#475569', fontFamily: "'Space Mono', monospace", fontSize: 10 }}
          axisLine={{ stroke: '#1e2d4a' }}
          tickLine={false}
        />

        <YAxis
          tick={{ fill: '#475569', fontFamily: "'Space Mono', monospace", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
          width={40}
        />

        <Tooltip
          contentStyle={{
            background: '#0d1526',
            border: '1px solid #1e2d4a',
            borderRadius: 8,
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            color: '#e2e8f0',
          }}
          labelFormatter={(label) => formatDate(label)}
          formatter={(value, name) => [value.toLocaleString(), name]}
        />

        <Legend
          formatter={(value) => (
            <span style={{ color: '#94a3b8', fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
              {value}
            </span>
          )}
        />

        <Area
          type="monotone"
          dataKey="IN"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#colorIN)"
          dot={false}
          activeDot={{ r: 5, fill: '#10b981', stroke: '#0a0f1e', strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="OUT"
          stroke="#ef4444"
          strokeWidth={2}
          fill="url(#colorOUT)"
          dot={false}
          activeDot={{ r: 5, fill: '#ef4444', stroke: '#0a0f1e', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
