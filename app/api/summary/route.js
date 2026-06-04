import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1
  const year = parseInt(searchParams.get('year')) || new Date().getFullYear()

  const startOfMonth = new Date(year, month - 1, 1).toISOString()
  const endOfMonth = new Date(year, month, 0, 23, 59, 59).toISOString()

  const supabaseAdmin = getSupabaseAdmin()
  const { data: transactions } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .gte('created_at', startOfMonth)
    .lte('created_at', endOfMonth)

  if (!transactions) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  const totalPemasukan = transactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalPengeluaran = transactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0)

  const categoryMap = {}
  const { data: categories } = await getSupabaseAdmin().from('categories').select('*')

  transactions
    .filter((t) => t.type === 'pengeluaran')
    .forEach((t) => {
      if (!categoryMap[t.category]) {
        const cat = categories?.find((c) => c.name === t.category)
        categoryMap[t.category] = { category: t.category, total: 0, icon: cat?.icon || '📦' }
      }
      categoryMap[t.category].total += t.amount
    })

  const byCategory = Object.values(categoryMap).sort((a, b) => b.total - a.total)

  const monthly = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1)
    const ms = d.toISOString()
    const me = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const { data: monthData } = await getSupabaseAdmin()
      .from('transactions')
      .select('type, amount')
      .gte('created_at', ms)
      .lte('created_at', me)

    const inc = (monthData || [])
      .filter((t) => t.type === 'pemasukan')
      .reduce((s, t) => s + t.amount, 0)
    const exp = (monthData || [])
      .filter((t) => t.type === 'pengeluaran')
      .reduce((s, t) => s + t.amount, 0)

    monthly.push({
      month: MONTHS[d.getMonth()],
      pemasukan: inc,
      pengeluaran: exp,
    })
  }

  const dailyTrend = []
  let runningBalance = 0
  const allTransactions = [...transactions].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  )

  const dailyMap = {}
  allTransactions.forEach((t) => {
    const day = t.created_at.split('T')[0]
    if (!dailyMap[day]) dailyMap[day] = 0
    dailyMap[day] += t.type === 'pemasukan' ? t.amount : -t.amount
  })

  Object.entries(dailyMap).forEach(([date, change]) => {
    runningBalance += change
    dailyTrend.push({ date, saldo: runningBalance })
  })

  return NextResponse.json({
    totalPemasukan,
    totalPengeluaran,
    saldo: totalPemasukan - totalPengeluaran,
    byCategory,
    monthly,
    dailyTrend,
  })
}
