'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password),
  }
  const allValid = rules.length && rules.upper && rules.symbol

  async function handleSignup(e) {
    e.preventDefault()
    setError('')

    if (!allValid) {
      return setError('Please meet all password requirements')
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return setError('PIN must be exactly 4 digits')
    }
    if (pin !== confirmPin) {
      return setError('PINs do not match')
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setLoading(false)
      return setError(signUpError.message)
    }

    const pinHash = await sha256(pin)
    localStorage.setItem('sf_pin_hash', pinHash)
    localStorage.setItem('sf_email', email)
    localStorage.setItem('sf_session_pw', password)

    setLoading(false)

    if (!data.session) {
      setNeedsConfirmation(true)
    } else {
      router.push('/')
    }
  }

  if (needsConfirmation) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream-50 px-6">
        <div className="garden-card text-center flex flex-col gap-3 max-w-sm">
          <div className="text-4xl">📩</div>
          <h1 className="font-heading text-2xl text-sage-700">Almost there!</h1>
          <p className="text-sage-600">
            We've sent a confirmation link to <strong>{email}</strong>. Please check your inbox and click the link to activate your account.
          </p>
          <p className="text-sm text-sage-500">Once confirmed, come back and log in with your PIN.</p>
          <a href="/" className="text-sm text-sage-500 underline mt-2">Back to login</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream-50 px-6">
      <form onSubmit={handleSignup} className="garden-card flex flex-col gap-4 w-full max-w-sm">
        <h1 className="font-heading text-2xl text-sage-700 text-center">🌻🐰 Plant your garden</h1>

        <input
          type="email"
          placeholder="Email"
          required
          className="rounded-2xl border border-sage-100 p-3"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            required
            className="rounded-2xl border border-sage-100 p-3 w-full pr-12"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-500 text-sm"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {password.length > 0 && (
          <div className="flex flex-col gap-1 -mt-2 text-sm">
            <RuleLine ok={rules.length} label="At least 8 characters" />
            <RuleLine ok={rules.upper} label="One uppercase letter" />
            <RuleLine ok={rules.symbol} label="One symbol (e.g. & @ ! #)" />
            {allValid && (
              <p className="text-sage-700 flex items-center gap-1 mt-1">
                ✅ Strong password
              </p>
            )}
          </div>
        )}

        <div className="relative">
          <input
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            placeholder="Choose a 4-digit PIN"
            required
            maxLength={4}
            className="rounded-2xl border border-sage-100 p-3 w-full pr-12"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          />
          <button
            type="button"
            onClick={() => setShowPin(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-500 text-sm"
          >
            {showPin ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirmPin ? 'text' : 'password'}
            inputMode="numeric"
            placeholder="Confirm PIN"
            required
            maxLength={4}
            className="rounded-2xl border border-sage-100 p-3 w-full pr-12"
            value={confirmPin}
            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPin(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-500 text-sm"
          >
            {showConfirmPin ? 'Hide' : 'Show'}
          </button>
        </div>

        {error && <p className="text-sm text-rose-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-gold-400 text-white rounded-full py-3 font-bold active:scale-95 transition disabled:opacity-50"
        >
          {loading ? 'Planting...' : 'Create account'}
        </button>

        <a href="/" className="text-sm text-sage-500 text-center underline">
          Already have an account? Log in with PIN
        </a>
      </form>
    </main>
  )
}

function RuleLine({ ok, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={ok ? 'text-sage-600' : 'text-gray-300'}>{ok ? '✔' : '○'}</span>
      <span className={ok ? 'text-sage-700' : 'text-gray-400'}>{label}</span>
    </div>
  )
}

async function sha256(msg) {
  const data = new TextEncoder().encode(msg)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}