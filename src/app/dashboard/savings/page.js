'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatINR } from '@/lib/format'
import EntryRow from '@/components/EntryRow'

const BUCKETS = ['Groww', 'IndMoney', 'Jar']
const BUCKET_COLORS = { Groww: '#9CB18E', IndMoney: '#EFAB98', Jar: '#F2B8B0' }

export default function SavingsDetailPage() {
  const [entries, setEntries] = useState([])
  const [filter, setFilter] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('savings').select('*').eq('user_id', user.id).order('entry_date', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  const totals = BUCKETS.map(b => ({
    bucket: b,
    total: entries.filter(e => e.bucket === b).reduce((a,r) => a + Number(r.amount), 0)
  }))
  const grandTotal = totals.reduce((a,t) => a + t.total, 0)
  const filtered = filter ? entries.filter(e => e.bucket === filter) : entries

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <a href="/dashboard" className="text-sage-500 text-sm">‹ Back</a>
      <h1 className="font-heading text-2xl text-sage-700 my-3">Savings 🌻</h1>

      <div className="garden-card bg-gold-100 mb-4">
        <p className="text-xs text-sage-500">Total saved away</p>
        <p className="font-heading text-3xl text-gold-700">{formatINR(grandTotal)}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {totals.map(t => (
          <button key={t.bucket} onClick={() => setFilter(filter === t.bucket ? null : t.bucket)}
            className={`garden-card !p-3 text-center ${filter === t.bucket ? 'ring-2 ring-sage-400' : ''}`}>
            <p className="text-xs text-sage-500">{t.bucket}</p>
            <p className="font-heading text-sm text-sage-700">{formatINR(t.total)}</p>
          </button>
        ))}
      </div>

      <p className="font-heading text-sage-700 mb-2">Recent entries</p>
      {loading ? (
        <p className="text-sage-500 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sage-500 text-sm text-center mt-10">Nothing saved yet 🌱</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(e => (
            <EntryRow key={e.id}
              color={BUCKET_COLORS[e.bucket] || '#E7EEE2'}
              label={e.bucket}
              sub={`${e.note || 'No note'} · ${e.entry_date}`}
              amount={'+' + formatINR(e.amount)}
              amountColor="#5C7052"
            />
          ))}
        </div>
      )}

      <a href="/savings" className="fixed bottom-6 right-6 z-20 bg-gold-400 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg">+</a>
    </main>
  )
}