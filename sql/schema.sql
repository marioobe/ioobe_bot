-- Tabel transaksi utama
CREATE TABLE transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        VARCHAR(20) NOT NULL CHECK (type IN ('pemasukan', 'pengeluaran')),
  amount      BIGINT NOT NULL,
  category    VARCHAR(50) NOT NULL,
  description TEXT,
  raw_message TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);

-- Tabel kategori (untuk referensi dan ikon)
CREATE TABLE categories (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  VARCHAR(50) UNIQUE NOT NULL,
  icon  VARCHAR(10),
  type  VARCHAR(20) CHECK (type IN ('pemasukan', 'pengeluaran', 'both'))
);

INSERT INTO categories (name, icon, type) VALUES
  ('makan', '🍜', 'pengeluaran'),
  ('transport', '🚗', 'pengeluaran'),
  ('belanja', '🛒', 'pengeluaran'),
  ('tagihan', '📄', 'pengeluaran'),
  ('hiburan', '🎮', 'pengeluaran'),
  ('kesehatan', '💊', 'pengeluaran'),
  ('lainnya', '📦', 'pengeluaran'),
  ('gaji', '💼', 'pemasukan'),
  ('transfer', '💸', 'pemasukan'),
  ('freelance', '💻', 'pemasukan'),
  ('hadiah', '🎁', 'pemasukan');
