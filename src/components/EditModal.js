'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

export default function EditModal({ open, entry, table, fields, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (entry) {
      const initial = {}
      fields.forEach(f => { initial[f.name] = entry[f.name] ?? '' })
      setForm(initial)
      setConfirmDelete(false)
    }
  }, [entry])

  if (!open || !entry) return null

  async function handleSave() {
    setSaving(true)
    const payload = { ...form }
    if (payload.amount !== undefined) payload.amount = Number(payload.amount)
    const { error } = await supabase.from(table).update(payload).eq('id', entry.id)
    setSaving(false)
    if (error) return toast.error('Could not update')
    toast.success('Updated 🌱')
    onSaved()
  }

  async function handleDelete() {
    setSaving(true)
    const { error } = await supabase.from(table).delete().eq('id', entry.id)
    setSaving(false)
    if (error) return toast.error('Could not delete')
    toast.success('Removed')
    onDeleted()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="garden-card w-full sm:w-96 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="font-heading text-xl text-sage-700 mb-4">Edit entry</h2>
        <div className="flex flex-col gap-3">
          {fields.map(f => (
            <div key={f.name}>
              <label className="text-xs text-sage-500">{f.label}</label>
              {f.type === 'select' ? (
                <select className="rounded-2xl border border-sage-100 p-3 w-full"
                  value={form[f.name] ?? ''} onChange={e => setForm({...form, [f.name]: e.target.value})}>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea className="rounded-2xl border border-sage-100 p-3 w-full"
                  value={form[f.name] ?? ''} onChange={e => setForm({...form, [f.name]: e.target.value})} />
              ) : (
                <input type={f.type} className="rounded-2xl border border-sage-100 p-3 w-full"
                  value={form[f.name] ?? ''} onChange={e => setForm({...form, [f.name]: e.target.value})} />
              )}
            </div>
          ))}
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-gold-400 text-white rounded-full py-3 font-bold active:scale-95 transition disabled:opacity-50 mt-5">
          {saving ? 'Saving...' : 'Save changes'}
        </button>

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="w-full text-rose-500 text-sm mt-3 py-2">
            Delete entry
          </button>
        ) : (
          <div className="mt-3 bg-rose-50 rounded-2xl p-3 text-center">
            <p className="text-sm text-rose-600 mb-2">Delete this entry? This can't be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 border border-sage-200 rounded-full py-2 text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 bg-rose-500 text-white rounded-full py-2 text-sm disabled:opacity-50">
                {saving ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        )}

        <button onClick={onClose} className="w-full text-sage-400 text-sm mt-2 py-1">Close</button>
      </div>
    </div>
  )
}