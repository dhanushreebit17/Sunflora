'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

export default function AccountPage() {
  const [form, setForm] = useState({
    display_name: '', bank_name: '', account_last4: '', card_network: '',
    card_last4: '', bank_helpline: '', emergency_contact_name: '', emergency_contact_phone: '', note: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('account_info').select('*').eq('user_id', user.id).maybeSingle()
    if (data) setForm(prev => ({ ...prev, ...data }))
    setLoading(false)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('account_info').upsert({
      ...form, user_id: user.id, updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) return toast.error('Could not save')
    toast.success('Saved 🌱')
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  if (loading) return <p className="p-6 text-center">Loading... 🌻</p>

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <a href="/dashboard" className="text-sage-500 text-sm">‹ Back</a>
      <h1 className="font-heading text-2xl text-sage-700 my-3">Your Account 👤</h1>

      <form onSubmit={save} className="flex flex-col gap-4">
        <div className="garden-card flex flex-col gap-3">
          <h2 className="font-heading text-lg text-sage-700">Profile</h2>
          <input type="text" placeholder="Your name" className="rounded-2xl border border-sage-100 p-3"
            value={form.display_name || ''} onChange={set('display_name')} />
        </div>

        <div className="garden-card flex flex-col gap-3">
          <h2 className="font-heading text-lg text-sage-700">Emergency Bank Info</h2>
          <p className="text-xs text-sage-500 -mt-1">For emergencies only — full card numbers, CVVs, and PINs are never stored.</p>
          <input type="text" placeholder="Bank name" className="rounded-2xl border border-sage-100 p-3"
            value={form.bank_name || ''} onChange={set('bank_name')} />
          <input type="text" placeholder="Account — last 4 digits" maxLength={4} className="rounded-2xl border border-sage-100 p-3"
            value={form.account_last4 || ''} onChange={set('account_last4')} />
          <input type="text" placeholder="Card network (Visa, RuPay...)" className="rounded-2xl border border-sage-100 p-3"
            value={form.card_network || ''} onChange={set('card_network')} />
          <input type="text" placeholder="Card — last 4 digits" maxLength={4} className="rounded-2xl border border-sage-100 p-3"
            value={form.card_last4 || ''} onChange={set('card_last4')} />
          <input type="text" placeholder="Bank helpline number" className="rounded-2xl border border-sage-100 p-3"
            value={form.bank_helpline || ''} onChange={set('bank_helpline')} />
        </div>

        <div className="garden-card flex flex-col gap-3">
          <h2 className="font-heading text-lg text-sage-700">Emergency Contact</h2>
          <input type="text" placeholder="Contact name" className="rounded-2xl border border-sage-100 p-3"
            value={form.emergency_contact_name || ''} onChange={set('emergency_contact_name')} />
          <input type="text" placeholder="Contact phone" className="rounded-2xl border border-sage-100 p-3"
            value={form.emergency_contact_phone || ''} onChange={set('emergency_contact_phone')} />
        </div>

        <div className="garden-card flex flex-col gap-3">
          <h2 className="font-heading text-lg text-sage-700">Note</h2>
          <textarea placeholder="Anything else important..." className="rounded-2xl border border-sage-100 p-3"
            value={form.note || ''} onChange={set('note')} />
        </div>

        <button disabled={saving} className="bg-gold-400 text-white rounded-full py-3 font-bold active:scale-95 transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </main>
  )
}