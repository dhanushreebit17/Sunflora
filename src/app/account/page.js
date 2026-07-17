'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import EntryRow from '@/components/EntryRow'
import EditModal from '@/components/EditModal'

const ICONS = ['🐰', '🌻', '🦋', '🐝', '🌼', '🍃', '🐞', '🌸']

export default function AccountPage() {
  const [form, setForm] = useState({
    display_name: '', avatar_icon: '🐰',
    emergency_contact_name: '', emergency_contact_phone: '', note: ''
  })
  const [accounts, setAccounts] = useState([])
  const [addingAccount, setAddingAccount] = useState(false)
  const [newAccount, setNewAccount] = useState({ label:'', bank_name:'', account_last4:'', card_network:'', card_last4:'', helpline:'' })
  const [editingAccount, setEditingAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [infoRes, accountsRes] = await Promise.all([
      supabase.from('account_info').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('bank_accounts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])
    if (infoRes.data) setForm(prev => ({ ...prev, ...infoRes.data }))
    setAccounts(accountsRes.data || [])
    setLoading(false)
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('account_info').upsert({
      display_name: form.display_name,
      avatar_icon: form.avatar_icon,
      emergency_contact_name: form.emergency_contact_name,
      emergency_contact_phone: form.emergency_contact_phone,
      note: form.note,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) return toast.error('Could not save account details')
    toast.success('Account details saved 🌱')
  }

  async function addAccount() {
    if (!newAccount.label.trim()) return toast.error('Give this account a label first')
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('bank_accounts').insert({ ...newAccount, user_id: user.id })
    if (error) return toast.error('Could not add account')
    toast.success('Bank account added 🌱')
    setNewAccount({ label:'', bank_name:'', account_last4:'', card_network:'', card_last4:'', helpline:'' })
    setAddingAccount(false)
    load()
  }

  if (loading) return <p className="p-6 text-center">Loading... 🌻</p>

  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen">
      <a href="/dashboard" className="text-sage-500 text-sm">‹ Back</a>
      <h1 className="font-heading text-2xl text-sage-700 my-3">Your Account 👤</h1>

      <form onSubmit={saveProfile} className="flex flex-col gap-4">
        <div className="garden-card flex flex-col gap-3">
          <h2 className="font-heading text-lg text-sage-700">Profile</h2>
          <input type="text" placeholder="Your name" className="rounded-2xl border border-sage-100 p-3"
            value={form.display_name || ''} onChange={set('display_name')} />

          <p className="text-xs text-sage-500">Pick an icon</p>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(icon => (
              <button key={icon} type="button" onClick={() => setForm({...form, avatar_icon: icon})}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 transition
                  ${form.avatar_icon === icon ? 'border-sage-400 bg-sage-100' : 'border-transparent bg-cream-100'}`}>
                {icon}
              </button>
            ))}
          </div>
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
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <div className="garden-card flex flex-col gap-3 mt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg text-sage-700">Bank Accounts</h2>
          <p className="text-xs text-sage-500">Last-4-digit only, for now</p>
        </div>

        {accounts.length === 0 && !addingAccount && (
          <p className="text-sage-500 text-sm">No accounts saved yet.</p>
        )}

        <div className="flex flex-col gap-2">
          {accounts.map(a => (
            <div key={a.id} onClick={() => setEditingAccount(a)} className="cursor-pointer active:scale-[0.99] transition">
              <EntryRow color="#9CB18E" label={a.label} sub={`${a.bank_name || ''} ${a.account_last4 ? '···' + a.account_last4 : ''}`}
                amount={a.card_last4 ? 'card ···' + a.card_last4 : ''} amountColor="#5C7052" />
            </div>
          ))}
        </div>

        {!addingAccount ? (
          <button type="button" onClick={() => setAddingAccount(true)}
            className="border border-sage-200 text-sage-600 rounded-full py-2.5 text-sm font-bold">
            + Add bank account
          </button>
        ) : (
          <div className="flex flex-col gap-2 bg-cream-100 rounded-2xl p-3">
            <input type="text" placeholder="Label (e.g. SBI Savings)" className="rounded-2xl border border-sage-100 p-2.5"
              value={newAccount.label} onChange={e => setNewAccount({...newAccount, label: e.target.value})} />
            <input type="text" placeholder="Bank name" className="rounded-2xl border border-sage-100 p-2.5"
              value={newAccount.bank_name} onChange={e => setNewAccount({...newAccount, bank_name: e.target.value})} />
            <input type="text" placeholder="Account — last 4 digits" maxLength={4} className="rounded-2xl border border-sage-100 p-2.5"
              value={newAccount.account_last4} onChange={e => setNewAccount({...newAccount, account_last4: e.target.value})} />
            <input type="text" placeholder="Card network" className="rounded-2xl border border-sage-100 p-2.5"
              value={newAccount.card_network} onChange={e => setNewAccount({...newAccount, card_network: e.target.value})} />
            <input type="text" placeholder="Card — last 4 digits" maxLength={4} className="rounded-2xl border border-sage-100 p-2.5"
              value={newAccount.card_last4} onChange={e => setNewAccount({...newAccount, card_last4: e.target.value})} />
            <input type="text" placeholder="Helpline number" className="rounded-2xl border border-sage-100 p-2.5"
              value={newAccount.helpline} onChange={e => setNewAccount({...newAccount, helpline: e.target.value})} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setAddingAccount(false)} className="flex-1 border border-sage-200 rounded-full py-2 text-sm">Cancel</button>
              <button type="button" onClick={addAccount} className="flex-1 bg-sage-400 text-white rounded-full py-2 text-sm font-bold">Add</button>
            </div>
          </div>
        )}
      </div>

      <EditModal open={!!editingAccount} entry={editingAccount} table="bank_accounts"
        fields={[
          { name: 'label', label: 'Label', type: 'text' },
          { name: 'bank_name', label: 'Bank name', type: 'text' },
          { name: 'account_last4', label: 'Account — last 4 digits', type: 'text' },
          { name: 'card_network', label: 'Card network', type: 'text' },
          { name: 'card_last4', label: 'Card — last 4 digits', type: 'text' },
          { name: 'helpline', label: 'Helpline number', type: 'text' },
        ]}
        onClose={() => setEditingAccount(null)}
        onSaved={() => { setEditingAccount(null); load() }}
        onDeleted={() => { setEditingAccount(null); load() }} />
    </main>
  )
}