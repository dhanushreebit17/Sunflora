'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
export default function MoneyIn() {
    const [form, setForm] = useState({ amount:'', source:'', entry_date: new Date().toISOString().slice(0,10), note:'' })
async function submit(e) {
e.preventDefault()
const { data: { user } } = await supabase.auth.getUser()
const { error } = await supabase.from('income').insert({ ...form, amount: Number(form.amount), user_id: user.id })
if (error) return toast.error('Could not save n')
toast.success('Added to your garden! n')
setForm({ amount:'', source:'', entry_date: new Date().toISOString().slice(0,10), note:'' })
}
return (
<main className="p-5 pb-24 bg-cream-50 min-h-screen">
<h1 className="font-heading text-2xl text-sage-700 mb-4">Money In</h1>
<form onSubmit={submit} className="garden-card flex flex-col gap-4">
<input type="number" placeholder="Amount (n)" required
className="rounded-2xl border border-sage-100 p-3"
value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} />
<input type="text" placeholder="Who gave it? (Dad, Salary, Freelance...)" required
className="rounded-2xl border border-sage-100 p-3"
value={form.source} onChange={e=>setForm({...form, source:e.target.value})} />
<input type="date" className="rounded-2xl border border-sage-100 p-3"
value={form.entry_date} onChange={e=>setForm({...form, entry_date:e.target.value})} />
<textarea placeholder="Note (optional)" className="rounded-2xl border border-sage-100 p-3"
value={form.note} onChange={e=>setForm({...form, note:e.target.value})} />
<button className="bg-gold-400 text-white rounded-full py-3 font-bold active:scale-95 transition">
Plant it n
</button>
</form>
</main>
)
}