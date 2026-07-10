'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import PinPad from '@/components/PinPad'
export default function Home() {
const router = useRouter()
const [error, setError] = useState('')
useEffect(() => {
// If a session token is already stored, skip straight to PIN check
}, [])
const handlePin = async (pin) => {
const savedHash = localStorage.getItem('sf_pin_hash') // set at signup
const savedEmail = localStorage.getItem('sf_email')
const savedPassword = localStorage.getItem('sf_session_pw')
// NOTE: for production, verify PIN against profiles.pin_hash server-side
// via a Supabase Edge Function instead of comparing on the client.
const enteredHash = await sha256(pin)
if (enteredHash === savedHash) {
const { error } = await supabase.auth.signInWithPassword({
email: savedEmail, password: savedPassword
})
if (error) return setError('Session expired, please log in again')
router.push('/dashboard')
} else {
setError('Wrong PIN, try again')
}
}
return (
<main className="min-h-screen flex items-center justify-center bg-cream-50 px-6">
<PinPad onSubmit={handlePin} error={error} />
</main>
)
}
async function sha256(msg) {
const data = new TextEncoder().encode(msg)
const hash = await crypto.subtle.digest('SHA-256', data)
return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')
}