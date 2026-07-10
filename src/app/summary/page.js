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
<Tooltip formatter={(v) => `n${v.toLocaleString('en-IN')}`} />
</PieChart>
</ResponsiveContainer>
)
}