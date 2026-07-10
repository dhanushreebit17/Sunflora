export const metadata = {
title: 'Sunflower & Sage',
manifest: '/manifest.json',
themeColor: '#E0B33C',
appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Sunflower' },
}
export default function RootLayout({ children }) {
return (
<html lang="en">
<body>{children}</body>
</html>
)
}