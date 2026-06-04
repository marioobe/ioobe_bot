import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const INCOME_KEYWORDS = ['gaji', 'transfer', 'freelance', 'hadiah', 'bonus', 'rejeki', 'gain', 'profit', 'hasil']
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

export async function parseTransaction(message) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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

export async function generateInsight(summary) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Kamu adalah asisten keuangan pribadi. Analisis data transaksi berikut dan berikan 2-3 insight singkat dalam bahasa Indonesia yang ramah.

Data transaksi bulan ini:
- Total pemasukan: Rp ${summary.totalPemasukan?.toLocaleString('id-ID') || 0}
- Total pengeluaran: Rp ${summary.totalPengeluaran?.toLocaleString('id-ID') || 0}
- Sisa saldo: Rp ${summary.saldo?.toLocaleString('id-ID') || 0}
- Pengeluaran per kategori: ${JSON.stringify(summary.byCategory || [])}
- Rata-rata pengeluaran harian: Rp ${Math.round((summary.totalPengeluaran || 0) / 30).toLocaleString('id-ID')}

Berikan insight dalam format poin-poin singkat. Fokus pada pola pengeluaran, saran hemat, dan kebiasaan keuangan.`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch {
    return 'Insight AI sedang tidak tersedia. Coba lagi nanti.'
  }
}
