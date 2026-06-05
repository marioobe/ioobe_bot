'use client'

import { useState, useEffect } from 'react'
import TransactionTable from '@/components/TransactionTable'
import AddTransactionModal from '@/components/AddTransactionModal'
import { Search, Plus } from 'lucide-react'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const categories = [
  'semua', 'makan', 'transport', 'belanja', 'tagihan',
  'hiburan', 'kesehatan', 'lainnya', 'gaji', 'transfer',
  'freelance', 'hadiah',
]

export default function TransactionsPage() {
  const now = new Date()
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [filters, setFilters] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    type: '',
    category: '',
    search: '',
  })

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        month: filters.month,
        year: filters.year,
        page,
        perPage: 10,
      })
      if (filters.type) params.set('type', filters.type)
      if (filters.category) params.set('category', filters.category)
      if (filters.search) params.set('search', filters.search)

      const res = await fetch(`/api/transactions?${params}`)
      const result = await res.json()
      setData(result.data || [])
      setTotal(result.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [page, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Transaksi</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Tambah Manual
        </button>
      </div>

      <div className="glass-card p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select
            value={filters.month}
            onChange={(e) => handleFilterChange('month', e.target.value)}
            className="select-field text-sm"
          >
            {MONTHS.map((name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="select-field text-sm"
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            )}
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="select-field text-sm"
          >
            <option value="">Semua Tipe</option>
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="select-field text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat === 'semua' ? '' : cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Cari..."
              className="input-field pl-9 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        ) : (
          <TransactionTable
            data={data}
            page={page}
            total={total}
            perPage={10}
            onPageChange={setPage}
          />
        )}
      </div>

      <AddTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchTransactions}
      />
    </>
  )
}
