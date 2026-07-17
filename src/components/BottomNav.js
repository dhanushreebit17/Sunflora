'use client'
import { usePathname, useRouter } from 'next/navigation'

const HIDDEN_ON = ['/', '/signup']

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  if (HIDDEN_ON.includes(pathname)) return null

  const items = [
    { icon: '🏡', label: 'Home', href: '/dashboard' },
    { icon: '📜', label: 'History', href: '/history' },
    { icon: '➕', label: 'Add', href: '/add', center: true },
    { icon: '👤', label: 'You', href: '/account' },
  ]

  const isActive = (href) => pathname === href

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-sage-100 flex items-center justify-around px-2 pt-2 pb-3 z-30">
      {items.map(item => (
        <button key={item.href} onClick={() => router.push(item.href)}
          className="flex flex-col items-center gap-0.5 flex-1">
          <span className={`text-2xl font-bold ${isActive(item.href) ? 'text-sage-700' : 'text-lilac-400'}`}>
            {item.center ? '+' : item.icon}
          </span>
          <span className={`text-[10px] font-bold ${isActive(item.href) ? 'text-sage-700' : 'text-sage-400'}`}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}