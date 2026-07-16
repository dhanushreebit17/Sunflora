'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

const DEFAULT_BUCKETS = ['Groww', 'IndMoney', 'Jar']

export default function Savings() {
  const [buckets, setBuckets] = useState(DEFAULT_BUCKETS)
  const [form, setForm] = useState({ amount:'', bucket: DEFAULT_BUCKETS[0], entry_date: new Date().toISOString().slice(0,10), note:'' })
  const [addingNew, setAddingNew] = useState(false)
  const [newBucketName, setNewBucketName] = useState('')
  const [totals, setTotals] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadBucketsAndTotals() }, [])

  async function loadBucketsAndTotals() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('savings').select('bucket, amount').eq('user_id', user.id)
    const rows = data || []
    const found = [...new Set(rows.map(r => r.bucket))]
    const all = [...DEFAULT_BUCKETS, ...found.filter(b => !DEFAULT_BUCKETS.includes(b))]
    setBuckets(all)
    setTotals(all.map(b => ({ bucket: b, total: rows.filter(r => r.bucket === b).reduce((a,r) => a + Number(r.amount), 0) })))
  }

  function handleBucketChange(e) {
    if (e.target.value === '__new__') setAddingNew(true)
    else { setAddingNew(false); setForm({...form, bucket: e.target.value}) }
  }

  function confirmNewBucket() {
    const name = newBucketName.trim()
    if (!name) return
    setBuckets(prev => [...prev, name])
    setForm({...form, bucket: name})
    setAddingNew(false)
    setNewBucketName('')
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('savings').insert({
      amount: Number(form.amount), bucket: form.bucket, entry_date: form.entry_date, note: form.note, user_id: user.id
    })
    setLoading(false)
    if (error) return toast.error('Could not save')
    toast.success('Added to your garden! 🌻')
    setForm({ amount:'', bucket: form.bucket, entry_date: new Date().toISOString().slice(0,10), note:'' })
    loadBucketsAndTotals()
  }

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <h1 className="font-heading text-2xl text-sage-700 mb-4">Savings</h1>

      {totals.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {totals.map(t => (
            <div key={t.bucket} className="garden-card text-center !p-3">
              <p className="text-xs text-sage-500 truncate">{t.bucket}</p>
              <p className="font-bold text-sage-700 text-sm">₹{t.total.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="garden-card flex flex-col gap-4">
        <input type="number" placeholder="Amount (₹)" required className="rounded-2xl border border-sage-100 p-3"
          value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} />

        {!addingNew ? (
          <select required className="rounded-2xl border border-sage-100 p-3" value={form.bucket} onChange={handleBucketChange}>
            {buckets.map(b => <option key={b} value={b}>{b}</option>)}
            <option value="__new__">+ Add new bucket...</option>
          </select>
        ) : (
          <div className="flex gap-2">
            <input type="text" placeholder="New bucket name (e.g. LIC, PPF)" autoFocus
              className="rounded-2xl border border-sage-100 p-3 flex-1"
              value={newBucketName} onChange={e=>setNewBucketName(e.target.value)} />
            <button type="button" onClick={confirmNewBucket} className="bg-sage-400 text-white rounded-2xl px-4 font-bold">Add</button>
          </div>
        )}

        <input type="date" className="rounded-2xl border border-sage-100 p-3"
          value={form.entry_date} onChange={e=>setForm({...form, entry_date:e.target.value})} />

        <textarea placeholder="Note (optional)" className="rounded-2xl border border-sage-100 p-3"
          value={form.note} onChange={e=>setForm({...form, note:e.target.value})} />

        <button disabled={loading} className="bg-gold-400 text-white rounded-full py-3 font-bold active:scale-95 transition disabled:opacity-50">
          {loading ? 'Planting...' : 'Plant it 🌻'}
        </button>
      </form>
    </main>
  )
}