import './globals.css'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'ioobe_bot - Personal Finance Tracker',
  description: 'Track your finances with Telegram bot & AI-powered insights',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Sidebar />
        <div className="lg:ml-64 min-h-screen flex flex-col">
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
