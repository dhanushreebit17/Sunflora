'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatINR } from '@/lib/format'
import EntryRow from '@/components/EntryRow'

export default function ReceivedPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const startOfMonth = new Date(); startOfMonth.setDate(1)
    const { data } = await supabase.from('income').select('*').eq('user_id', user.id)
      .gte('entry_date', startOfMonth.toISOString().slice(0,10))
      .order('entry_date', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  const total = entries.reduce((a,r) => a + Number(r.amount), 0)

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <a href="/dashboard" className="text-sage-500 text-sm">‹ Back</a>
      <h1 className="font-heading text-2xl text-sage-700 my-3">Received This Month 📥</h1>

      <div className="garden-card bg-sage-100 mb-4">
        <p className="text-xs text-sage-500">Total received</p>
        <p className="font-heading text-3xl text-sage-700">{formatINR(total)}</p>
      </div>

      {loading ? (
        <p className="text-sage-500 text-sm">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-sage-500 text-sm text-center mt-10">Nothing logged yet 🌼</p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map(e => (
            <EntryRow key={e.id}
              color="#9CB18E"
              label={e.source}
              sub={e.entry_date}
              amount={'+' + formatINR(e.amount)}
              amountColor="#5C7052"
            />
          ))}
        </div>
      )}

      <a href="/money-in" className="fixed bottom-6 right-6 z-20 bg-gold-400 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg">+</a>
    </main>
  )
}