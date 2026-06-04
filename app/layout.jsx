import './globals.css'

export const metadata = {
  title: 'ioobe_bot - Personal Finance Tracker',
  description: 'Track your finances with Telegram bot & AI-powered insights',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
