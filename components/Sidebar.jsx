'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Bot } from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
]

export default function Sidebar() {
  const pathname = usePathname()
  const now = new Date()
  const monthName = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ][now.getMonth()]

  return (
    <aside className="w-64 min-h-screen bg-dark-sidebar border-r border-dark-border flex flex-col shrink-0">
      <div className="p-6 border-b border-dark-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-white">ioobe_bot</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-dark-border">
        <p className="text-xs text-gray-500">{monthName} {now.getFullYear()}</p>
      </div>
    </aside>
  )
}
