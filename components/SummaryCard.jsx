export default function SummaryCard({ icon, label, value, color }) {
  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  return (
    <div className="glass-card p-5 flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-xl font-semibold text-white">{formatRupiah(value)}</p>
      </div>
    </div>
  )
}
