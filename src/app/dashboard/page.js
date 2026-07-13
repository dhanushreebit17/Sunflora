'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import StatCard from '@/components/StatCard'

export default function Dashboard() {
    const [stats, setStats] = useState(null)

    useEffect(() => { loadStats() }, [])

    async function loadStats() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const startOfMonth = new Date(); startOfMonth.setDate(1)
        const today = new Date().toISOString().slice(0,10)

        const [{ data: income }, { data: expenses }, { data: savings }] = await Promise.all([
            supabase.from('income').select('amount, entry_date').eq('user_id', user.id),
            supabase.from('expenses').select('amount, entry_date').eq('user_id', user.id),
            supabase.from('savings').select('amount').eq('user_id', user.id),
        ])

        const sum = (rows, filterFn = () => true) =>
            rows.filter(filterFn).reduce((a,r) => a + Number(r.amount), 0)

        const inMonth = (r) => new Date(r.entry_date) >= startOfMonth
        const isToday = (r) => r.entry_date === today

        const totalIn = sum(income)
        const totalOut = sum(expenses)
        const monthIn = sum(income, inMonth)
        const monthOut = sum(expenses, inMonth)
        const totalSaved = sum(savings)

        setStats({
            balance: totalIn - totalOut - totalSaved,
            monthIn, monthOut,
            left: monthIn - monthOut,
            todaySpend: sum(expenses, isToday),
            totalSaved,
        })
    }

    if (!stats) return <p className="p-6 text-center">Loading your garden... 🌻</p>

    return (
        <main className="p-5 pb-24 bg-cream-50 min-h-screen">
            <h1 className="font-heading text-3xl text-sage-700 mb-4">Your Garden 🌱</h1>
            <div className="grid grid-cols-2 gap-4">
                <StatCard emoji="🌻" label="Total Balance" value={stats.balance} tone="gold" />
                <StatCard emoji="💰" label="Received this month" value={stats.monthIn} tone="sage" />
                <StatCard emoji="💸" label="Spent this month" value={stats.monthOut} tone="peach" />
                <StatCard emoji="🎯" label="Left this month" value={stats.left} tone="blush" />
                <StatCard emoji="☕" label="Today's spend" value={stats.todaySpend} tone="peach" />
                <StatCard emoji="🌱" label="Total saved" value={stats.totalSaved} tone="gold" />
            </div>
        </main>
    )
}