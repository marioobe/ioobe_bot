'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)

export default function TrendLine({ data }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-gray-300 mb-4">
        Tren Saldo Harian (30 Hari)
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3a" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            tick={{ fontSize: 11 }}
            tickFormatter={(val) => {
              const d = new Date(val)
              return `${d.getDate()}/${d.getMonth() + 1}`
            }}
          />
          <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={formatRupiah} />
          <Tooltip
            contentStyle={{
              background: '#1c1c1e',
              border: '1px solid #2d2d3a',
              borderRadius: '8px',
              color: '#e5e7eb',
            }}
            formatter={formatRupiah}
            labelFormatter={(val) => {
              const d = new Date(val)
              return d.toLocaleDateString('id-ID')
            }}
          />
          <Line
            type="monotone"
            dataKey="saldo"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
