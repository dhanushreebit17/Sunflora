'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

const CATEGORIES = ['Food', 'Shopping', 'Travel', 'Bills', 'Fun', 'Self-care', 'Other']
const MOODS = [
  { value: 'worth_it', label: '😊 Worth it' },
  { value: 'meh', label: '😐 Meh' },
  { value: 'regret', label: '😔 Regret' },
]

export default function MoneyOut() {
  const [form, setForm] = useState({
    amount: '',
    category: CATEGORIES[0],
    mood: 'worth_it',
    entry_date: new Date().toISOString().slice(0,10),
    note: ''
  })
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('expenses').insert({
      amount: Number(form.amount),
      category: form.category,
      mood: form.mood,
      entry_date: form.entry_date,
      note: form.note,
      user_id: user.id
    })
    setLoading(false)
    if (error) return toast.error('Could not save 🥀')
    toast.success('Logged it! 🌱')
    setForm({ amount:'', category: CATEGORIES[0], mood: 'worth_it', entry_date: new Date().toISOString().slice(0,10), note:'' })
  }

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <h1 className="font-heading text-2xl text-sage-700 mb-4">Money Out 🥀</h1>
      <form onSubmit={submit} className="garden-card flex flex-col gap-4">
        <input type="number" placeholder="Amount (₹)" required
          className="rounded-2xl border border-sage-100 p-3"
          value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} />

        <select required
          className="rounded-2xl border border-sage-100 p-3"
          value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <div className="flex gap-2">
          {MOODS.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => setForm({...form, mood: m.value})}
              className={`flex-1 rounded-2xl border p-2 text-sm transition
                ${form.mood === m.value ? 'bg-peach-100 border-peach-400' : 'border-sage-100'}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <input type="date" className="rounded-2xl border border-sage-100 p-3"
          value={form.entry_date} onChange={e=>setForm({...form, entry_date:e.target.value})} />

        <textarea placeholder="Note (optional)" className="rounded-2xl border border-sage-100 p-3"
          value={form.note} onChange={e=>setForm({...form, note:e.target.value})} />

        <button disabled={loading}
          className="bg-gold-400 text-white rounded-full py-3 font-bold active:scale-95 transition disabled:opacity-50">
          {loading ? 'Saving...' : 'Let it go 🥀'}
        </button>
      </form>
    </main>
  )
}