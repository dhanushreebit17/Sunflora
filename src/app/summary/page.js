'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#9CB18E','#E0B33C','#EFAB98','#F2B8B0','#C9971C','#5C7052','#E7EEE2']

function CategoryDonut({ data }) {
    // data = [{ name: 'Food', value: 3200 }, { name: 'Travel', value: 1500 }, ...]
    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
            </PieChart>
        </ResponsiveContainer>
    )
}

export default function Summary() {
    const [income, setIncome] = useState(0)
    const [savings, setSavings] = useState(0)
    const [expenses, setExpenses] = useState(0)
    const [categoryData, setCategoryData] = useState([])

    useEffect(() => { load() }, [])

    async function load() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: incomeRows } = await supabase.from('income').select('amount').eq('user_id', user.id)
        setIncome((incomeRows || []).reduce((a, r) => a + Number(r.amount), 0))

        const { data: savingsRows } = await supabase.from('savings').select('amount').eq('user_id', user.id)
        setSavings((savingsRows || []).reduce((a, r) => a + Number(r.amount), 0))

        const { data: expenseRows } = await supabase.from('expenses').select('amount, category').eq('user_id', user.id)
        const rows = expenseRows || []
        setExpenses(rows.reduce((a, r) => a + Number(r.amount), 0))

        const grouped = {}
        rows.forEach(r => {
            grouped[r.category] = (grouped[r.category] || 0) + Number(r.amount)
        })
        setCategoryData(Object.entries(grouped).map(([name, value]) => ({ name, value })))
    }

    return (
        <main className="p-5 pb-24 bg-cream-50 min-h-screen">
            <h1 className="font-heading text-2xl text-sage-700 mb-4">Summary</h1>

            <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="garden-card text-center">
                    <p className="text-sm text-sage-500">Income</p>
                    <p className="font-bold text-sage-700">₹{income}</p>
                </div>
                <div className="garden-card text-center">
                    <p className="text-sm text-sage-500">Expenses</p>
                    <p className="font-bold text-sage-700">₹{expenses}</p>
                </div>
                <div className="garden-card text-center">
                    <p className="text-sm text-sage-500">Savings</p>
                    <p className="font-bold text-sage-700">₹{savings}</p>
                </div>
            </div>

            <div className="garden-card">
                <h2 className="font-heading text-lg text-sage-700 mb-2">Spending by Category</h2>
                {categoryData.length > 0
                    ? <CategoryDonut data={categoryData} />
                    : <p className="text-sage-500 text-sm">No expenses logged yet.</p>}
            </div>
        </main>
    )
}
