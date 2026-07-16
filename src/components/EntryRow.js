export default function EntryRow({ color, label, sub, amount, amountColor }) {
  return (
    <div className="garden-card flex items-center justify-between !p-3 !rounded-2xl">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
        <div>
          <p className="font-bold text-sm text-sage-700">{label}</p>
          <p className="text-xs text-sage-500">{sub}</p>
        </div>
      </div>
      <p className="font-bold text-sm flex-shrink-0" style={{ color: amountColor }}>{amount}</p>
    </div>
  )
}