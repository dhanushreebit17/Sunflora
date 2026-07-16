'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatINR } from '@/lib/format'
import { CATEGORY_COLORS } from '@/lib/categoryColors'
import EntryRow from '@/components/EntryRow'
import EditModal from '@/components/EditModal'

const CATEGORIES = ['All', 'Food', 'Shopping', 'Travel', 'Bills', 'Fun', 'Self-care', 'Other']
const MOODS = ['worth_it', 'meh', 'regret']

export default function SpentPage() {
  const [entries, setEntries] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const startOfMonth = new Date(); startOfMonth.setDate(1)
    const { data } = await supabase.from('expenses').select('*').eq('user_id', user.id)
      .gte('entry_date', startOfMonth.toISOString().slice(0,10))
      .order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  const filtered = filter === 'All' ? entries : entries.filter(e => e.category === filter)
  const total = filtered.reduce((a,r) => a + Number(r.amount), 0)

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <a href="/dashboard" className="text-sage-500 text-sm">‹ Back</a>
      <h1 className="font-heading text-2xl text-sage-700 my-3">Spent This Month 🥀</h1>

      <div className="garden-card bg-peach-100 mb-4">
        <p className="text-xs text-sage-500">Total spent</p>
        <p className="font-heading text-3xl text-peach-400">{formatINR(total)}</p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold border ${filter === cat ? 'bg-sage-400 text-white border-sage-400' : 'bg-white text-sage-600 border-sage-100'}`}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sage-500 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sage-500 text-sm text-center mt-10">Nothing here yet 🌼</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(e => (
            <div key={e.id} onClick={() => setEditing(e)} className="cursor-pointer active:scale-[0.99] transition">
              <EntryRow color={CATEGORY_COLORS[e.category] || '#E7EEE2'} label={e.category}
                sub={`${e.note || 'No note'} · ${e.entry_date}`} amount={'−' + formatINR(e.amount)} amountColor="#EFAB98" />
            </div>
          ))}
        </div>
      )}

      <a href="/money-out" className="fixed bottom-6 right-6 z-20 bg-gold-400 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg">+</a>

      <EditModal open={!!editing} entry={editing} table="expenses"
        fields={[
          { name: 'amount', label: 'Amount (₹)', type: 'number' },
          { name: 'category', label: 'Category', type: 'select', options: CATEGORIES.filter(c => c !== 'All') },
          { name: 'mood', label: 'Mood', type: 'select', options: MOODS },
          { name: 'entry_date', label: 'Date', type: 'date' },
          { name: 'note', label: 'Note', type: 'textarea' },
        ]}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} onDeleted={() => { setEditing(null); load() }} />
    </main>
  )
}