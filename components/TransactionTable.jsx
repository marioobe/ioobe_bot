import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const categoryIcons = {
  makan: '\u{1F35C}',
  transport: '\u{1F697}',
  belanja: '\u{1F6D2}',
  tagihan: '\u{1F4C4}',
  hiburan: '\u{1F3AE}',
  kesehatan: '\u{1F48A}',
  lainnya: '\u{1F4E6}',
  gaji: '\u{1F4BC}',
  transfer: '\u{1F4B8}',
  freelance: '\u{1F4BB}',
  hadiah: '\u{1F381}',
}

export default function TransactionTable({ data, page, total, perPage, onPageChange }) {
  const totalPages = Math.ceil(total / perPage)

  const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-dark-border">
              <th className="text-left py-3 px-4 font-medium">Tanggal</th>
              <th className="text-left py-3 px-4 font-medium">Deskripsi</th>
              <th className="text-left py-3 px-4 font-medium">Kategori</th>
              <th className="text-left py-3 px-4 font-medium">Tipe</th>
              <th className="text-right py-3 px-4 font-medium">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-dark-border hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-300">
                  {format(new Date(tx.created_at), 'dd MMM yyyy', { locale: id })}
                </td>
                <td className="py-3 px-4 text-sm text-gray-200">{tx.description}</td>
                <td className="py-3 px-4 text-sm text-gray-300">
                  {categoryIcons[tx.category] || '\u{1F4E6}'} {tx.category}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={
                      tx.type === 'pemasukan' ? 'badge-income' : 'badge-expense'
                    }
                  >
                    {tx.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium tabular-nums">
                  <span
                    className={
                      tx.type === 'pemasukan' ? 'text-income' : 'text-expense'
                    }
                  >
                    {tx.type === 'pemasukan' ? '+' : '-'}
                    {formatRupiah(tx.amount)}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  Belum ada transaksi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-dark-border">
          <p className="text-sm text-gray-500">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="btn-ghost p-2 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="btn-ghost p-2 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
