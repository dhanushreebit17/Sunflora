'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatINR } from '@/lib/format'
import EntryRow from '@/components/EntryRow'

export default function BalancePage() {
  const [data, setData] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [incomeRes, expensesRes, savingsRes] = await Promise.all([
      supabase.from('income').select('amount').eq('user_id', user.id),
      supabase.from('expenses').select('amount').eq('user_id', user.id),
      supabase.from('savings').select('amount').eq('user_id', user.id),
    ])
    const sum = (rows) => (rows || []).reduce((a,r) => a + Number(r.amount), 0)
    const totalIn = sum(incomeRes.data)
    const totalOut = sum(expensesRes.data)
    const totalSaved = sum(savingsRes.data)
    setData({ totalIn, totalOut, totalSaved, balance: totalIn - totalOut - totalSaved })
  }

  if (!data) return <p className="p-6 text-center">Loading... 🌻</p>

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <a href="/dashboard" className="text-sage-500 text-sm">‹ Back</a>
      <h1 className="font-heading text-2xl text-sage-700 my-3">Total Balance 🐰</h1>

      <div className="garden-card bg-gold-100 mb-5">
        <p className="text-xs text-sage-500">Across income, savings & spending</p>
        <p className="font-heading text-3xl text-gold-700">{formatINR(data.balance)}</p>
      </div>

      <p className="font-heading text-sage-700 mb-2">Entries</p>
      <div className="flex flex-col gap-3">
        <a href="/dashboard/received" className="block">
          <EntryRow color="#9CB18E" label="Money In" sub="All-time received" amount={'+' + formatINR(data.totalIn)} amountColor="#5C7052" />
        </a>
        <a href="/dashboard/spent" className="block">
          <EntryRow color="#EFAB98" label="Money Out" sub="All-time spent" amount={'−' + formatINR(data.totalOut)} amountColor="#EFAB98" />
        </a>
        <a href="/dashboard/savings" className="block">
          <EntryRow color="#E0B33C" label="Saved away" sub="Groww · IndMoney · Jar" amount={'−' + formatINR(data.totalSaved)} amountColor="#A9791A" />
        </a>
      </div>
    </main>
  )
}