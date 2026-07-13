'use client'
import { useState } from 'react'

export default function PinPad({ onSubmit, error }) {
  const [pin, setPin] = useState('')

  const press = (digit) => {
    if (pin.length >= 4) return
    const next = pin + digit
    setPin(next)
    if (next.length === 4) {
      onSubmit(next)
      setTimeout(() => setPin(''), 400)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-4xl">Sunflora🌻</div>
      <h1 className="font-heading text-2xl text-sage-700">Welcome back</h1>
      <div className="flex gap-3">
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 border-peach-400
            ${i < pin.length ? 'bg-peach-400' : 'bg-white'}`} />
        ))}
      </div>
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <div className="grid grid-cols-3 gap-4">
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d,i) => (
          <button key={i}
            onClick={() => d === '⌫' ? setPin(p=>p.slice(0,-1)) : d && press(d)}
            className="w-16 h-16 rounded-full bg-cream-100 shadow-sm text-xl
              font-rounded active:scale-95 transition">
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}