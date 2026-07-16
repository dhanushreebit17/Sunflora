const PALETTE = ['#9CB18E', '#EFAB98', '#F2B8B0', '#E0B33C', '#C9971C', '#5C7052', '#8FA8D9']

export function getBucketColor(name, allBuckets) {
  const idx = allBuckets.indexOf(name)
  return PALETTE[idx >= 0 ? idx % PALETTE.length : 0]
}