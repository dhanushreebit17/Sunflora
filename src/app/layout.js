import './globals.css'

export const metadata = {
  title: 'Sunflower & Sage',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Sunflower' },
}

export const viewport = {
  themeColor: '#E0B33C',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
