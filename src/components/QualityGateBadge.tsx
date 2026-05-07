const CONFIG: Record<string, { label: string; bg: string }> = {
  OK:    { label: '✅ Passed', bg: '#00aa44' },
  ERROR: { label: '❌ Failed', bg: '#d4333f' },
  NONE:  { label: '⚠️ Unknown', bg: '#999' },
}

export default function QualityGateBadge({ value }: { value?: string }) {
  const cfg = CONFIG[value ?? 'NONE'] ?? CONFIG.NONE
  return (
    <span
      style={{
        background: cfg.bg,
        color: '#fff',
        padding: '3px 10px',
        borderRadius: 4,
        fontWeight: 600,
        fontSize: 13,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}
