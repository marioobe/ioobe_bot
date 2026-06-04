import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1
  const year = parseInt(searchParams.get('year')) || new Date().getFullYear()
  const type = searchParams.get('type')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page')) || 1
  const perPage = 10

  const startOfMonth = new Date(year, month - 1, 1).toISOString()
  const endOfMonth = new Date(year, month, 0, 23, 59, 59).toISOString()

  const supabaseAdmin = getSupabaseAdmin()
  let query = supabaseAdmin
    .from('transactions')
    .select('*', { count: 'exact' })
    .gte('created_at', startOfMonth)
    .lte('created_at', endOfMonth)
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)
  if (category) query = query.eq('category', category)
  if (search) query = query.ilike('description', `%${search}%`)

  const from = (page - 1) * perPage
  const to = from + perPage - 1
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    perPage,
  })
}

export async function POST(request) {
  const body = await request.json()

  if (!body.type || !body.amount || !body.category) {
    return NextResponse.json(
      { error: 'type, amount, and category are required' },
      { status: 400 }
    )
  }

  const supabaseAdmin2 = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin2
    .from('transactions')
    .insert({
      type: body.type,
      amount: body.amount,
      category: body.category,
      description: body.description || '',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
