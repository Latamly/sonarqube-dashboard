import type { Project } from '../types/sonarqube'

interface Props {
  projects: Project[]
}

function parseNum(v?: string) { return parseInt(v ?? '0') || 0 }

interface CardProps {
  label: string
  value: number | string
  color?: string
  sub?: string
}

function Card({ label, value, color, sub }: CardProps) {
  return (
    <div className="card" style={{ flex: '1 1 140px', minWidth: 130, borderTop: color ? `3px solid ${color}` : undefined }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color ?? 'var(--color-text)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function SummaryCards({ projects }: Props) {
  const total = projects.length
  const passed = projects.filter(p => p.quality_gate === 'OK').length
  const failed = projects.filter(p => p.quality_gate === 'ERROR').length
  const bugs = projects.reduce((s, p) => s + parseNum(p.metrics?.bugs), 0)
  const vulns = projects.reduce((s, p) => s + parseNum(p.metrics?.vulnerabilities), 0)
  const smells = projects.reduce((s, p) => s + parseNum(p.metrics?.code_smells), 0)
  const hotspots = projects.reduce((s, p) => s + parseNum(p.metrics?.security_hotspots), 0)

  const coverages = projects.map(p => parseFloat(p.metrics?.coverage ?? '0')).filter(n => !isNaN(n))
  const avgCoverage = coverages.length ? (coverages.reduce((a, b) => a + b, 0) / coverages.length) : 0

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Card label="Proyectos" value={total} sub={`${passed} passed · ${failed} failed`} color="var(--color-primary)" />
      <Card label="Bugs" value={bugs} color={bugs > 0 ? 'var(--color-blocker)' : 'var(--color-success)'} />
      <Card label="Vulnerabilidades" value={vulns} color={vulns > 0 ? 'var(--color-critical)' : 'var(--color-success)'} />
      <Card label="Code Smells" value={smells} color={smells > 10 ? 'var(--color-major)' : 'var(--color-success)'} />
      <Card label="Hotspots" value={hotspots} color={hotspots > 0 ? 'var(--color-minor)' : 'var(--color-success)'} />
      <Card label="Cobertura promedio" value={`${avgCoverage.toFixed(1)}%`} color={avgCoverage < 50 ? 'var(--color-danger)' : avgCoverage < 80 ? 'var(--color-warning)' : 'var(--color-success)'} />
    </div>
  )
}
