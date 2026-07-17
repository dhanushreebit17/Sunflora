'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatINR } from '@/lib/format'
import { CATEGORY_COLORS } from '@/lib/categoryColors'
import EntryRow from '@/components/EntryRow'
import EditModal from '@/components/EditModal'

const CATEGORIES = ['Food', 'Shopping', 'Travel', 'Bills', 'Fun', 'Self-care', 'Other']
const MOODS = ['worth_it', 'meh', 'regret']

export default function HistoryPage() {
  const [all, setAll] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [incomeRes, expensesRes, savingsRes] = await Promise.all([
      supabase.from('income').select('*').eq('user_id', user.id),
      supabase.from('expenses').select('*').eq('user_id', user.id),
      supabase.from('savings').select('*').eq('user_id', user.id),
    ])
    const income = (incomeRes.data || []).map(r => ({ ...r, _type: 'income' }))
    const expenses = (expensesRes.data || []).map(r => ({ ...r, _type: 'expenses' }))
    const savings = (savingsRes.data || []).map(r => ({ ...r, _type: 'savings' }))
    const merged = [...income, ...expenses, ...savings].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    setAll(merged)
    setLoading(false)
  }

  const filtered = filter === 'all' ? all : all.filter(r => r._type === filter)

  function rowProps(r) {
    if (r._type === 'income') return { color: '#9CB18E', label: r.source, sub: r.entry_date, amount: '+' + formatINR(r.amount), amountColor: '#5C7052' }
    if (r._type === 'expenses') return { color: CATEGORY_COLORS[r.category] || '#E7EEE2', label: r.category, sub: r.entry_date, amount: '−' + formatINR(r.amount), amountColor: '#EFAB98' }
    return { color: '#A9A46B', label: r.bucket, sub: r.entry_date, amount: '+' + formatINR(r.amount), amountColor: '#6E6B3E' }
  }

  function editFields(r) {
    if (r._type === 'income') return [
      { name: 'amount', label: 'Amount (₹)', type: 'number' },
      { name: 'source', label: 'Source', type: 'text' },
      { name: 'entry_date', label: 'Date', type: 'date' },
      { name: 'note', label: 'Note', type: 'textarea' },
    ]
    if (r._type === 'expenses') return [
      { name: 'amount', label: 'Amount (₹)', type: 'number' },
      { name: 'category', label: 'Category', type: 'select', options: CATEGORIES },
      { name: 'mood', label: 'Mood', type: 'select', options: MOODS },
      { name: 'entry_date', label: 'Date', type: 'date' },
      { name: 'note', label: 'Note', type: 'textarea' },
    ]
    return [
      { name: 'amount', label: 'Amount (₹)', type: 'number' },
      { name: 'bucket', label: 'Bucket', type: 'text' },
      { name: 'entry_date', label: 'Date', type: 'date' },
      { name: 'note', label: 'Note', type: 'textarea' },
    ]
  }

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <h1 className="font-heading text-2xl text-sage-700 mb-4">History 📜</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['all','income','expenses','savings'].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold border capitalize ${filter === t ? 'bg-sage-400 text-white border-sage-400' : 'bg-white text-sage-600 border-sage-100'}`}>
            {t === 'all' ? 'All' : t === 'income' ? 'Received' : t === 'expenses' ? 'Spent' : 'Savings'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sage-500 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sage-500 text-sm text-center mt-10">Nothing here yet 🌼</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(r => (
            <div key={`${r._type}-${r.id}`} onClick={() => setEditing(r)} className="cursor-pointer active:scale-[0.99] transition">
              <EntryRow {...rowProps(r)} />
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditModal open={!!editing} entry={editing} table={editing._type}
          fields={editFields(editing)}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
          onDeleted={() => { setEditing(null); load() }} />
      )}
    </main>
  )
}