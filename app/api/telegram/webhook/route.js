import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { parseTransaction } from '@/lib/gemini'
import { sendMessage } from '@/lib/telegram'

export async function POST(request) {
  const webhookSecret = request.headers.get('x-telegram-bot-api-secret-token')

  if (webhookSecret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const message = body.message

  if (!message?.text) {
    return NextResponse.json({ ok: true })
  }

  const chatId = message.chat.id
  const parsed = await parseTransaction(message.text)

  if (parsed.type === 'none') {
    await sendMessage(
      chatId,
      `Hmm, aku tidak mengenali itu sebagai transaksi. Coba kirim seperti: 'makan siang 15000' atau 'dapat gaji 2000000' \u{1F60A}`
    )
    return NextResponse.json({ ok: true })
  }

  const { error } = await getSupabaseAdmin().from('transactions').insert({
    type: parsed.type,
    amount: parsed.amount,
    category: parsed.category,
    description: parsed.description,
    raw_message: message.text,
  })

  if (error) {
    await sendMessage(chatId, `Maaf, terjadi kesalahan: ${error.message}`)
    return NextResponse.json({ ok: true })
  }

  const { data: monthData } = await getSupabaseAdmin()
    .from('transactions')
    .select('type, amount')
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const totalPemasukan = (monthData || [])
    .filter((t) => t.type === 'pemasukan')
    .reduce((s, t) => s + t.amount, 0)
  const totalPengeluaran = (monthData || [])
    .filter((t) => t.type === 'pengeluaran')
    .reduce((s, t) => s + t.amount, 0)
  const saldo = totalPemasukan - totalPengeluaran

  const typeLabel = parsed.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'

  const reply =
    `\u2705 Transaksi dicatat!\n\n` +
    `\u{1F4CD} Tipe     : ${typeLabel}\n` +
    `\u{1F4B0} Nominal  : Rp ${parsed.amount.toLocaleString('id-ID')}\n` +
    `\u{1F3F7}\uFE0F Kategori : ${parsed.category.charAt(0).toUpperCase() + parsed.category.slice(1)}\n` +
    `\u{1F4DD} Deskripsi: ${parsed.description}\n\n` +
    `Saldo bulan ini: Rp ${saldo.toLocaleString('id-ID')}`

  await sendMessage(chatId, reply)

  return NextResponse.json({ ok: true })
}
