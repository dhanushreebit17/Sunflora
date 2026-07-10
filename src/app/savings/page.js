// Same form pattern as Money In, but with a bucket selector:
const BUCKETS = ['Groww', 'IndMoney', 'Jar']
// Insert:
await supabase.from('savings').insert({
amount: Number(amount), bucket, entry_date, note, user_id: user.id
})
// Totals per bucket, fetched with:
const { data } = await supabase.from('savings').select('bucket, amount').eq('user_id', user.id)
const totals = BUCKETS.map(b => ({
bucket: b,
total: data.filter(r => r.bucket === b).reduce((a,r) => a + Number(r.amount), 0)
}))