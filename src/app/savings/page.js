'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

const BUCKETS = ['Groww', 'IndMoney', 'Jar']

export default function Savings() {
    const [form, setForm] = useState({ amount:'', bucket: BUCKETS[0], entry_date: new Date().toISOString().slice(0,10), note:'' })
    const [totals, setTotals] = useState([])

    async function loadTotals() {
        const { data: { user } } = await supabase.auth.getUser()
        const { data } = await supabase.from('savings').select('bucket, amount').eq('user_id', user.id)
        if (data) {
            setTotals(BUCKETS.map(b => ({
                bucket: b,
                total: data.filter(r => r.bucket === b).reduce((a, r) => a + Number(r.amount), 0)
            })))
        }
    }

    useEffect(() => { loadTotals() }, [])

    async function submit(e) {
        e.preventDefault()
        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await supabase.from('savings').insert({
            amount: Number(form.amount),
            bucket: form.bucket,
            entry_date: form.entry_date,
            note: form.note,
            user_id: user.id
        })
        if (error) return toast.error('Could not save')
        toast.success('Added to your garden!')
        setForm({ amount:'', bucket: BUCKETS[0], entry_date: new Date().toISOString().slice(0,10), note:'' })
        loadTotals()
    }

    return (
        <main className="p-5 pb-24 bg-cream-50 min-h-screen">
            <h1 className="font-heading text-2xl text-sage-700 mb-4">Savings</h1>

            <div className="grid grid-cols-3 gap-3 mb-5">
                {totals.map(t => (
                    <div key={t.bucket} className="garden-card text-center">
                        <p className="text-sm text-sage-500">{t.bucket}</p>
                        <p className="font-bold text-sage-700">₹{t.total}</p>
                    </div>
                ))}
            </div>

            <form onSubmit={submit} className="garden-card flex flex-col gap-4">
                <input type="number" placeholder="Amount (₹)" required
                    className="rounded-2xl border border-sage-100 p-3"
                    value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} />
                <select required
                    className="rounded-2xl border border-sage-100 p-3"
                    value={form.bucket} onChange={e=>setForm({...form, bucket:e.target.value})}>
                    {BUCKETS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <input type="date" className="rounded-2xl border border-sage-100 p-3"
                    value={form.entry_date} onChange={e=>setForm({...form, entry_date:e.target.value})} />
                <textarea placeholder="Note (optional)" className="rounded-2xl border border-sage-100 p-3"
                    value={form.note} onChange={e=>setForm({...form, note:e.target.value})} />
                <button className="bg-gold-400 text-white rounded-full py-3 font-bold active:scale-95 transition">
                    Plant it
                </button>
            </form>
        </main>
    )
}
