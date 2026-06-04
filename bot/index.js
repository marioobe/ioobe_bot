require('dotenv').config({ path: '.env.local' })
const TelegramBot = require('node-telegram-bot-api')
const { createClient } = require('@supabase/supabase-js')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })

const INCOME_KEYWORDS = ['gaji', 'transfer', 'freelance', 'hadiah', 'bonus', 'rejeki', 'gain', 'profit', 'hasil']
const EXPENSE_KEYWORDS = ['makan', 'transport', 'belanja', 'tagihan', 'hiburan', 'kesehatan', 'bensin', 'jajan', 'beli']
const CATEGORY_MAP = {
  makan: ['makan', 'jajan', 'sarapan', 'makan siang', 'makan malam', 'cemilan', 'kopi', 'minum'],
  transport: ['bensin', 'transport', 'bus', 'kereta', 'ojek', 'grab', 'gojek', 'taxi', 'angkot'],
  belanja: ['belanja', 'shopping', 'baju', 'sepatu', 'pakaian'],
  tagihan: ['tagihan', 'listrik', 'air', 'pdam', 'pln', 'internet', 'pulsa', 'bpjs'],
  hiburan: ['hiburan', 'nonton', 'film', 'game', 'steam', 'netflix', 'spotify'],
  kesehatan: ['obat', 'dokter', 'rumah sakit', 'kesehatan', 'vitamin'],
  gaji: ['gaji', 'salary'],
  transfer: ['transfer', 'kirim'],
  freelance: ['freelance', 'proyek', 'project'],
  hadiah: ['hadiah', 'kado', 'bonus'],
}

function localParse(message) {
  const lower = message.toLowerCase()
  const numbers = message.match(/\d+/g)
  if (!numbers) return { type: 'none' }

  const amount = parseInt(numbers[numbers.length - 1])
  const desc = message.replace(/\d+/g, '').trim()

  let type = 'pengeluaran'
  for (const word of INCOME_KEYWORDS) {
    if (lower.includes(word)) { type = 'pemasukan'; break }
  }

  let category = 'lainnya'
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) { category = cat; break }
    }
    if (category !== 'lainnya') break
  }

  if (type === 'pemasukan' && !['gaji', 'transfer', 'freelance', 'hadiah'].includes(category)) {
    category = 'transfer'
  }

  return { type, amount, category, description: desc || 'transaksi' }
}

async function parseTransaction(message) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const prompt = `Kamu adalah asisten pencatat keuangan pribadi berbahasa Indonesia.
Tugasmu adalah mengekstrak informasi transaksi keuangan dari pesan pengguna.

Pesan: "${message}"

Kembalikan HANYA JSON (tanpa markdown, tanpa penjelasan) dengan format:
{
  "type": "pemasukan" atau "pengeluaran" atau "none",
  "amount": angka nominal dalam rupiah (tanpa titik/koma),
  "category": kategori transaksi (makan/transport/belanja/tagihan/hiburan/kesehatan/gaji/transfer/freelance/hadiah/lainnya),
  "description": deskripsi singkat transaksi
}

Jika pesan tidak berkaitan dengan keuangan, kembalikan {"type": "none"}.
Contoh:
- "jajan 5000" -> {"type":"pengeluaran","amount":5000,"category":"makan","description":"jajan"}
- "dapat transferan dari kakak 300000" -> {"type":"pemasukan","amount":300000,"category":"transfer","description":"transferan dari kakak"}
- "halo apa kabar" -> {"type":"none"}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const cleaned = text.replace(/```json?/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return localParse(message)
  }
}

async function getMonthlyBalance() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data } = await supabase
    .from('transactions')
    .select('type, amount')
    .gte('created_at', startOfMonth)

  if (!data) return 0

  const totalPemasukan = data
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalPengeluaran = data
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0)

  return totalPemasukan - totalPengeluaran
}

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return

  const chatId = msg.chat.id
  const parsed = await parseTransaction(msg.text)

  if (parsed.type === 'none') {
    await bot.sendMessage(
      chatId,
      `Hmm, aku tidak mengenali itu sebagai transaksi. Coba kirim seperti: 'makan siang 15000' atau 'dapat gaji 2000000' \u{1F60A}`
    )
    return
  }

  const { error } = await supabase.from('transactions').insert({
    type: parsed.type,
    amount: parsed.amount,
    category: parsed.category,
    description: parsed.description,
    raw_message: msg.text,
  })

  if (error) {
    await bot.sendMessage(chatId, `Maaf, terjadi kesalahan: ${error.message}`)
    return
  }

  const saldo = await getMonthlyBalance()
  const typeLabel = parsed.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'

  const reply =
    `\u2705 Transaksi dicatat!\n\n` +
    `\u{1F4CD} Tipe     : ${typeLabel}\n` +
    `\u{1F4B0} Nominal  : Rp ${parsed.amount.toLocaleString('id-ID')}\n` +
    `\u{1F3F7}\uFE0F Kategori : ${parsed.category.charAt(0).toUpperCase() + parsed.category.slice(1)}\n` +
    `\u{1F4DD} Deskripsi: ${parsed.description}\n\n` +
    `Saldo bulan ini: Rp ${saldo.toLocaleString('id-ID')}`

  await bot.sendMessage(chatId, reply)
})

console.log('ioobe_bot polling started...')
