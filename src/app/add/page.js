export default function AddPage() {
  return (
    <main className="p-5 pb-24 bg-cream-50 min-h-screen flex flex-col justify-center">
      <h1 className="font-heading text-2xl text-sage-700 mb-6 text-center">What are you logging?</h1>
      <div className="flex flex-col gap-4">
        <a href="/money-in" className="garden-card bg-sage-100 text-sage-700 text-center py-6">
          <p className="text-3xl mb-1">📥</p>
          <p className="font-bold">Money In</p>
        </a>
        <a href="/money-out" className="garden-card bg-peach-100 text-peach-400 text-center py-6">
          <p className="text-3xl mb-1">🥀</p>
          <p className="font-bold">Money Out</p>
        </a>
        <a href="/savings" className="garden-card bg-olive-100 text-olive-700 text-center py-6">
          <p className="text-3xl mb-1">🌻</p>
          <p className="font-bold">Savings</p>
        </a>
      </div>
    </main>
  )
}