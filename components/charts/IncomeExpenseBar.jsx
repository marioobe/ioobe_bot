'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)

export default function IncomeExpenseBar({ data }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-gray-300 mb-4">
        Pemasukan vs Pengeluaran (6 Bulan)
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3a" />
          <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={formatRupiah} />
          <Tooltip
            contentStyle={{
              background: '#1c1c1e',
              border: '1px solid #2d2d3a',
              borderRadius: '8px',
              color: '#e5e7eb',
            }}
            formatter={formatRupiah}
          />
          <Legend />
          <Bar dataKey="pemasukan" name="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
