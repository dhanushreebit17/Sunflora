'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatINR } from '@/lib/format'
import { CATEGORY_COLORS } from '@/lib/categoryColors'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [categoryData, setCategoryData] = useState([])

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startOfMonth = new Date(); startOfMonth.setDate(1)
    const today = new Date().toISOString().slice(0,10)

    const [incomeRes, expensesRes, savingsRes] = await Promise.all([
      supabase.from('income').select('amount, entry_date').eq('user_id', user.id),
      supabase.from('expenses').select('amount, entry_date, category').eq('user_id', user.id),
      supabase.from('savings').select('amount').eq('user_id', user.id),
    ])

    const income = incomeRes.data || []
    const expenses = expensesRes.data || []
    const savings = savingsRes.data || []

    const sum = (rows, filterFn = () => true) =>
      rows.filter(filterFn).reduce((a,r) => a + Number(r.amount), 0)

    const inMonth = (r) => new Date(r.entry_date) >= startOfMonth
    const isToday = (r) => r.entry_date === today

    const totalIn = sum(income)
    const totalOut = sum(expenses)
    const monthIn = sum(income, inMonth)
    const monthOut = sum(expenses, inMonth)
    const totalSaved = sum(savings)

    setStats({
      balance: totalIn - totalOut - totalSaved,
      monthIn, monthOut,
      left: monthIn - monthOut,
      todaySpend: sum(expenses, isToday),
      totalSaved,
    })

    const grouped = {}
    expenses.filter(inMonth).forEach(r => {
      grouped[r.category] = (grouped[r.category] || 0) + Number(r.amount)
    })
    setCategoryData(Object.entries(grouped).map(([name, value]) => ({ name, value })))
  }

  if (!stats) return <p className="p-6 text-center">Loading your garden... 🌻</p>

  const rows = [
    { label: 'Total Balance', value: stats.balance, tone: 'gold', href: '/dashboard/balance' },
    { label: 'Received this month', value: stats.monthIn, tone: 'sage', href: '/dashboard/received' },
    { label: 'Spent this month', value: stats.monthOut, tone: 'peach', href: '/dashboard/spent' },
    { label: 'Left this month', value: stats.left, tone: 'blush', href: '/dashboard/left' },
    { label: "Today's spend", value: stats.todaySpend, tone: 'peach', href: '/dashboard/today' },
    { label: 'Total saved', value: stats.totalSaved, tone: 'gold', href: '/dashboard/savings' },
  ]

  const toneClasses = {
    sage: 'bg-sage-100 text-sage-700',
    gold: 'bg-gold-100 text-gold-700',
    peach: 'bg-peach-100 text-peach-400',
    blush: 'bg-blush-100 text-peach-400',
  }

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <h1 className="font-heading text-3xl text-sage-700 mb-4">Your Garden 🌱</h1>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <a href="/money-in" className="whitespace-nowrap bg-sage-100 text-sage-700 rounded-full px-4 py-2 text-sm font-bold">+ Money In</a>
        <a href="/money-out" className="whitespace-nowrap bg-peach-100 text-peach-400 rounded-full px-4 py-2 text-sm font-bold">+ Money Out</a>
        <a href="/savings" className="whitespace-nowrap bg-gold-100 text-gold-700 rounded-full px-4 py-2 text-sm font-bold">+ Savings</a>
      </div>

      <div className="garden-card mb-5">
        <h2 className="font-heading text-lg text-sage-700 mb-2">This month by category</h2>
        {categoryData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {categoryData.map((d, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[d.name] || '#E7EEE2'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatINR(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2">
              {categoryData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-sage-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[d.name] || '#E7EEE2' }} />
                  {d.name}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sage-500 text-sm">No expenses logged yet this month.</p>
        )}
      </div>

      <p className="text-sage-500 text-xs mb-2">Tap a card for details</p>
      <div className="flex flex-col gap-3">
        {rows.map(r => (
          <a key={r.label} href={r.href} className={`garden-card flex items-center justify-between !py-4 ${toneClasses[r.tone]}`}>
            <span className="font-bold text-sm">{r.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg">{formatINR(r.value)}</span>
              <span className="opacity-60">›</span>
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}