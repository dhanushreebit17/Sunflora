'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatINR } from '@/lib/format'
import { CATEGORY_COLORS } from '@/lib/categoryColors'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [chartType, setChartType] = useState('pie')
  const [profile, setProfile] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    supabase.from('account_info').select('display_name, avatar_icon').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setProfile(data))

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
    { label: 'Left this month', value: stats.left, tone: 'lilac', href: '/dashboard/left' },
    { label: "Today's spend", value: stats.todaySpend, tone: 'mint', href: '/dashboard/today' },
    { label: 'Total saved', value: stats.totalSaved, tone: 'olive', href: '/dashboard/savings' },
  ]

  const toneClasses = {
    sage: 'bg-sage-100 text-sage-700',
    gold: 'bg-gold-100 text-gold-700',
    peach: 'bg-peach-100 text-peach-400',
    lilac: 'bg-lilac-100 text-lilac-700',
    mint: 'bg-mint-100 text-mint-700',
    olive: 'bg-olive-100 text-olive-700',
  }

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-3xl text-sage-700">Your Garden 🌱</h1>
        <a href="/account" className="flex items-center gap-2 flex-shrink-0">
          {profile?.display_name && <span className="text-sm font-bold text-sage-700">{profile.display_name}</span>}
          <span className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center text-lg">{profile?.avatar_icon || '🐰'}</span>
        </a>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <a href="/money-in" className="whitespace-nowrap bg-sage-100 text-sage-700 rounded-full px-4 py-2 text-sm font-bold">+ Money In</a>
        <a href="/money-out" className="whitespace-nowrap bg-peach-100 text-peach-400 rounded-full px-4 py-2 text-sm font-bold">+ Money Out</a>
        <a href="/savings" className="whitespace-nowrap bg-gold-100 text-gold-700 rounded-full px-4 py-2 text-sm font-bold">+ Savings</a>
      </div>

      <div className="garden-card mb-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading text-lg text-sage-700">This month by category</h2>
          <div className="flex gap-1 bg-cream-100 rounded-full p-1">
            {['pie','bar','line'].map(t => (
              <button key={t} onClick={() => setChartType(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${chartType === t ? 'bg-sage-400 text-white' : 'text-sage-500'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {categoryData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={220}>
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}
                       paddingAngle={3} label={({ name }) => name} labelLine={false}>
                    {categoryData.map((d, i) => <Cell key={i} fill={CATEGORY_COLORS[d.name] || '#E7EEE2'} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatINR(v)} />
                </PieChart>
              ) : chartType === 'bar' ? (
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7EEE2" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatINR(v)} />
                  <Bar dataKey="value" radius={[8,8,0,0]}>
                    {categoryData.map((d, i) => <Cell key={i} fill={CATEGORY_COLORS[d.name] || '#E7EEE2'} />)}
                  </Bar>
                </BarChart>
              ) : (
                <LineChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7EEE2" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatINR(v)} />
                  <Line type="monotone" dataKey="value" stroke="#E0B33C" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              )}
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