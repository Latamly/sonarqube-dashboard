const BG: Record<string, string> = {
  A: '#00aa44',
  B: '#b0d400',
  C: '#ffaa00',
  D: '#f06600',
  E: '#d4333f',
}

export default function RatingBadge({ value }: { value?: string }) {
  const v = value ?? '—'
  return (
    <span
      style={{
        background: BG[v] ?? '#999',
        color: '#fff',
        padding: '2px 10px',
        borderRadius: 4,
        fontWeight: 700,
        fontSize: 13,
        display: 'inline-block',
        minWidth: 28,
        textAlign: 'center',
      }}
    >
      {v}
    </span>
  )
}
