'use client'

import { useState, useEffect } from 'react'
import SummaryCard from '@/components/SummaryCard'
import IncomeExpenseBar from '@/components/charts/IncomeExpenseBar'
import CategoryPie from '@/components/charts/CategoryPie'
import TrendLine from '@/components/charts/TrendLine'
import TransactionTable from '@/components/TransactionTable'
import { Wallet, TrendingUp, TrendingDown, Brain, ChevronDown, ChevronUp } from 'lucide-react'

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [insight, setInsight] = useState('')
  const [insightOpen, setInsightOpen] = useState(false)
  const [insightLoading, setInsightLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, txRes] = await Promise.all([
          fetch(`/api/summary?month=${month}&year=${year}`),
          fetch(`/api/transactions?month=${month}&year=${year}&page=1`),
        ])
        const summaryData = await summaryRes.json()
        const txData = await txRes.json()
        setSummary(summaryData)
        setTransactions(txData.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [month, year])

  const loadInsight = async () => {
    setInsightLoading(true)
    try {
      const res = await fetch(`/api/insight?month=${month}&year=${year}`)
      const data = await res.json()
      setInsight(data.insight || '')
    } catch (err) {
      setInsight('Gagal memuat insight.')
    } finally {
      setInsightLoading(false)
    }
  }

  const toggleInsight = () => {
    const newOpen = !insightOpen
    setInsightOpen(newOpen)
    if (newOpen && !insight) loadInsight()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          icon={<TrendingUp size={20} />}
          label="Total Pemasukan"
          value={summary?.totalPemasukan || 0}
          color="#22c55e"
        />
        <SummaryCard
          icon={<TrendingDown size={20} />}
          label="Total Pengeluaran"
          value={summary?.totalPengeluaran || 0}
          color="#ef4444"
        />
        <SummaryCard
          icon={<Wallet size={20} />}
          label="Saldo Bulan Ini"
          value={summary?.saldo || 0}
          color="#6366f1"
        />
      </div>

      <div className="mb-6">
        <IncomeExpenseBar data={summary?.monthly || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CategoryPie data={summary?.byCategory || []} />
        <TrendLine data={summary?.dailyTrend || []} />
      </div>

      <div className="glass-card mb-6 overflow-hidden">
        <button
          onClick={toggleInsight}
          className="w-full flex items-center justify-between p-5 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Brain size={16} className="text-accent" />
            </div>
            <span className="text-sm font-medium text-gray-200">AI Insight</span>
          </div>
          {insightOpen ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </button>
        {insightOpen && (
          <div className="px-5 pb-5">
            {insightLoading ? (
              <p className="text-sm text-gray-400">Menganalisis data...</p>
            ) : (
              <p className="text-sm text-gray-300 whitespace-pre-line">{insight}</p>
            )}
          </div>
        )}
      </div>

      <div className="glass-card">
        <div className="px-5 py-4 border-b border-dark-border">
          <h3 className="text-sm font-medium text-gray-300">
            Transaksi Terbaru
          </h3>
        </div>
        <TransactionTable
          data={transactions.slice(0, 5)}
          page={1}
          total={transactions.length}
          perPage={5}
          onPageChange={() => {}}
        />
      </div>
    </>
  )
}
