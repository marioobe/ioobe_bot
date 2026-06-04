'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const categories = [
  { name: 'makan', icon: '\u{1F35C}', type: 'pengeluaran' },
  { name: 'transport', icon: '\u{1F697}', type: 'pengeluaran' },
  { name: 'belanja', icon: '\u{1F6D2}', type: 'pengeluaran' },
  { name: 'tagihan', icon: '\u{1F4C4}', type: 'pengeluaran' },
  { name: 'hiburan', icon: '\u{1F3AE}', type: 'pengeluaran' },
  { name: 'kesehatan', icon: '\u{1F48A}', type: 'pengeluaran' },
  { name: 'lainnya', icon: '\u{1F4E6}', type: 'pengeluaran' },
  { name: 'gaji', icon: '\u{1F4BC}', type: 'pemasukan' },
  { name: 'transfer', icon: '\u{1F4B8}', type: 'pemasukan' },
  { name: 'freelance', icon: '\u{1F4BB}', type: 'pemasukan' },
  { name: 'hadiah', icon: '\u{1F381}', type: 'pemasukan' },
]

export default function AddTransactionModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    type: 'pengeluaran',
    amount: '',
    category: 'makan',
    description: '',
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const filteredCategories = categories.filter(
    (c) => c.type === form.type || c.type === 'both'
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          amount: parseInt(form.amount),
          category: form.category,
          description: form.description,
        }),
      })

      if (res.ok) {
        setForm({ type: 'pengeluaran', amount: '', category: 'makan', description: '' })
        onSuccess()
        onClose()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Tambah Transaksi</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Tipe</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'pengeluaran', category: 'makan' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.type === 'pengeluaran'
                    ? 'bg-expense/20 text-expense border border-expense/30'
                    : 'bg-dark border border-dark-border text-gray-400'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'pemasukan', category: 'gaji' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.type === 'pemasukan'
                    ? 'bg-income/20 text-income border border-income/30'
                    : 'bg-dark border border-dark-border text-gray-400'
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Nominal (Rp)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="15000"
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Kategori</label>
            <div className="grid grid-cols-3 gap-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.name })}
                  className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                    form.category === cat.name
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'bg-dark border border-dark-border text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Deskripsi</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="makan siang"
              className="input-field"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  )
}
