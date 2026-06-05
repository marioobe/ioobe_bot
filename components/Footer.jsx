'use client'

import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-dark-border px-6 lg:px-8 py-4">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs text-gray-500 text-center lg:text-left">
          &copy; 2026 EduTrack &mdash; Dibuat dengan{' '}
          <Heart size={12} className="inline text-red-500 fill-red-500" /> Oleh Io Obe
        </p>
      </div>
    </footer>
  )
}
