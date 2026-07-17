import './globals.css'
import { Toaster } from 'react-hot-toast'
import BottomNav from '@/components/BottomNav'

export const metadata = {
  title: 'Sunflora 🌻',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Sunflora' },
}

export const viewport = {
  themeColor: '#E0B33C',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <BottomNav />
        <Toaster position="top-center" toastOptions={{
          style: { background: '#FBF6EA', color: '#5C7052', borderRadius: '16px' }
        }} />
      </body>
    </html>
  )
}