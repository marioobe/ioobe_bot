import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { generateInsight } from '@/lib/gemini'

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
        categoryMap[t.category] = { category: t.category, total: 0, icon: cat?.icon || '' }
      }
      categoryMap[t.category].total += t.amount
    })

  const summary = {
    totalPemasukan,
    totalPengeluaran,
    saldo: totalPemasukan - totalPengeluaran,
    byCategory: Object.values(categoryMap),
  }

  const insight = await generateInsight(summary)

  return NextResponse.json({ insight })
}
