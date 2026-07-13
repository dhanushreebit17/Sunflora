export default function StatCard({ emoji, label, value, tone = 'sage' }) {
    const tones = {
        sage: 'bg-sage-100 text-sage-700',
        gold: 'bg-gold-100 text-gold-700',
        peach: 'bg-peach-100 text-peach-400',
        blush: 'bg-blush-100 text-blush-400',
    }
    return (
        <div className={`garden-card ${tones[tone]}`}>
            <div className="text-2xl mb-1">{emoji}</div>
            <p className="text-xs opacity-70">{label}</p>
            <p className="text-xl font-bold">₹{value.toLocaleString('en-IN')}</p>
        </div>
    )
}