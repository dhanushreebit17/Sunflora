'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatINR } from '@/lib/format'
import { CATEGORY_COLORS } from '@/lib/categoryColors'
import EntryRow from '@/components/EntryRow'

export default function TodayPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().slice(0,10)
    const { data } = await supabase.from('expenses').select('*').eq('user_id', user.id).eq('entry_date', today)
    setEntries(data || [])
    setLoading(false)
  }

  const total = entries.reduce((a,r) => a + Number(r.amount), 0)

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <a href="/dashboard" className="text-sage-500 text-sm">‹ Back</a>
      <h1 className="font-heading text-2xl text-sage-700 my-3">Today's Spend ☀️</h1>

      <div className="garden-card bg-peach-100 mb-4">
        <p className="text-xs text-sage-500">Spent today so far</p>
        <p className="font-heading text-3xl text-peach-400">{formatINR(total)}</p>
      </div>

      {loading ? (
        <p className="text-sage-500 text-sm">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-sage-500 text-sm text-center mt-10">Nothing spent yet today 🦋🌼</p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map(e => (
            <EntryRow key={e.id}
              color={CATEGORY_COLORS[e.category] || '#E7EEE2'}
              label={e.category}
              sub={e.note || 'No note'}
              amount={'−' + formatINR(e.amount)}
              amountColor="#EFAB98"
            />
          ))}
        </div>
      )}

      <a href="/money-out" className="fixed bottom-6 right-6 z-20 bg-gold-400 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg">+</a>
    </main>
  )
}