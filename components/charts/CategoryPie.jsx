'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const COLORS = [
  '#6366f1', '#22c55e', '#ef4444', '#f59e0b',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16',
  '#14b8a6', '#f97316', '#6b7280',
]

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)

export default function CategoryPie({ data }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-gray-300 mb-4">
        Pengeluaran per Kategori
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            paddingAngle={3}
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#1c1c1e',
              border: '1px solid #2d2d3a',
              borderRadius: '8px',
              color: '#e5e7eb',
            }}
            formatter={(value, name) => [formatRupiah(value), name]}
          />
          <Legend
            formatter={(value) => (
              <span className="text-gray-400 text-xs">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
