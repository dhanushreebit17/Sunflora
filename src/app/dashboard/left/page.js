'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatINR } from '@/lib/format'

export default function LeftPage() {
  const [data, setData] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const startOfMonth = new Date(); startOfMonth.setDate(1)
    const monthStr = startOfMonth.toISOString().slice(0,10)
    const [incomeRes, expensesRes] = await Promise.all([
      supabase.from('income').select('amount').eq('user_id', user.id).gte('entry_date', monthStr),
      supabase.from('expenses').select('amount').eq('user_id', user.id).gte('entry_date', monthStr),
    ])
    const income = (incomeRes.data || []).reduce((a,r) => a + Number(r.amount), 0)
    const expenses = (expensesRes.data || []).reduce((a,r) => a + Number(r.amount), 0)
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()
    const daysLeft = Math.max(daysInMonth - now.getDate(), 1)
    const remaining = income - expenses
    setData({ income, expenses, remaining, daysLeft, dailyBudget: Math.max(remaining,0) / daysLeft })
  }

  if (!data) return <p className="p-6 text-center">Loading... 🌻</p>

  const maxVal = Math.max(data.income, data.expenses, 1)

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <a href="/dashboard" className="text-sage-500 text-sm">‹ Back</a>
      <h1 className="font-heading text-2xl text-sage-700 my-3">Left This Month 🌼</h1>

      <div className={`garden-card mb-5 ${data.remaining >= 0 ? 'bg-blush-100' : 'bg-peach-100'}`}>
        <p className="text-xs text-sage-500">Remaining to spend</p>
        <p className="font-heading text-3xl text-peach-400">{formatINR(data.remaining)}</p>
      </div>

      <p className="font-heading text-sage-700 mb-2">Income vs Expense</p>
      <div className="mb-1">
        <div className="w-full h-4 bg-sage-100 rounded-full overflow-hidden">
          <div className="h-full bg-sage-400" style={{ width: `${(data.income/maxVal)*100}%` }} />
        </div>
        <p className="text-xs text-sage-600 mt-1">Income {formatINR(data.income)}</p>
      </div>
      <div className="mb-4">
        <div className="w-full h-4 bg-peach-100 rounded-full overflow-hidden">
          <div className="h-full bg-peach-400" style={{ width: `${(data.expenses/maxVal)*100}%` }} />
        </div>
        <p className="text-xs text-peach-400 mt-1">Expenses {formatINR(data.expenses)}</p>
      </div>

      <div className="garden-card bg-gold-100">
        <p className="text-xs text-gold-700">Suggested daily budget</p>
        <p className="font-heading text-xl text-gold-700">{formatINR(Math.round(data.dailyBudget))} / day</p>
        <p className="text-xs text-gold-700">{data.daysLeft} days left in month</p>
      </div>
    </main>
  )
}