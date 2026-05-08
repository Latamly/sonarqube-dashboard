import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJson } from '../hooks/useSonarData'
import type { Issue, Rule, Project } from '../types/sonarqube'
import RatingBadge from './RatingBadge'
import QualityGateBadge from './QualityGateBadge'
import IssueRow from './IssueRow'
import IssueDrawer from './IssueDrawer'
import IssuesBySeverityChart from './charts/IssuesBySeverityChart'
import IssuesByTypeChart from './charts/IssuesByTypeChart'
import IssuesByFileChart from './charts/IssuesByFileChart'

function ratingLabel(raw?: string): string {
  const n = parseInt(raw ?? '0')
  return ['', 'A', 'B', 'C', 'D', 'E'][n] ?? '—'
}

function parseNum(v?: string) { return parseFloat(v ?? '0') || 0 }

const SEVERITIES = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO']

function CoverageBar({ label, value, goodAbove }: { label: string; value: number; goodAbove: boolean }) {
  const good = goodAbove ? value >= 80 : value <= 3
  const warn = goodAbove ? value >= 50 : value <= 10
  const color = good ? 'var(--color-success)' : warn ? 'var(--color-warning)' : 'var(--color-danger)'
  const fill = goodAbove ? value : Math.min(value * 5, 100)
  return (
    <div>
      <div className="flex-between mb-2" style={{ marginBottom: 6 }}>
        <span className="text-sm text-secondary">{label}</span>
        <span className="font-bold" style={{ color, fontSize: 14 }}>{value.toFixed(1)}%</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${Math.min(fill, 100)}%`, background: color }} />
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  accent?: string
  badge?: string
}

function MetricCard({ label, value, accent, badge }: MetricCardProps) {
  return (
    <div className="card" style={{ textAlign: 'center', borderTop: accent ? `3px solid ${accent}` : undefined, minWidth: 110 }}>
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {badge && <div style={{ marginTop: 6 }}><RatingBadge value={badge} /></div>}
      <div className="text-xs text-secondary" style={{ marginTop: 6 }}>{label}</div>
    </div>
  )
}

export default function ProjectDetail() {
  const { key } = useParams<{ key: string }>()
  const navigate = useNavigate()
  const decoded = decodeURIComponent(key ?? '')

  const { data: projects } = useJson<Project[]>('data/projects.json')
  const { data: metrics, loading: ml } = useJson<Record<string, string>>(`data/metrics-${decoded}.json`)
  const { data: issues, loading: il } = useJson<Issue[]>(`data/issues-${decoded}.json`)
  const { data: rules } = useJson<Record<string, Rule>>('data/rules.json')

  const [severityFilter, setSeverityFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  const project = projects?.find(p => p.key === decoded)

  const filteredIssues = (issues ?? []).filter(i => {
    if (severityFilter !== 'ALL' && i.severity !== severityFilter) return false
    if (typeFilter !== 'ALL' && i.type !== typeFilter) return false
    return true
  })

  const issueTypes = [...new Set((issues ?? []).map(i => i.type))]

  if (ml || il) return (
    <div className="empty-state">
      <div className="empty-state-icon">⏳</div>
      <p>Cargando…</p>
    </div>
  )

  const m = metrics ?? {}
  const coverage = parseNum(m.coverage)
  const duplication = parseNum(m.duplicated_lines_density)

  return (
    <div className="page">
      {/* Header */}
      <div className="flex-between mb-6" style={{ flexWrap: 'wrap', gap: 12 }}>
        <button className="btn-ghost" onClick={() => navigate('/')} style={{ paddingLeft: 0 }}>
          ← Volver
        </button>
      </div>

      <div className="flex-between mb-6" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>{project?.name ?? decoded}</h1>
          <code className="font-mono text-sm text-muted" style={{ display: 'block', marginTop: 4 }}>{decoded}</code>
        </div>
        <QualityGateBadge value={project?.quality_gate} />
      </div>

      {metrics && (
        <>
          {/* Metric cards */}
          <div className="metrics-grid mb-6">
            <MetricCard label="Bugs" value={m.bugs ?? '—'} accent={parseInt(m.bugs ?? '0') > 0 ? 'var(--color-blocker)' : 'var(--color-success)'} badge={ratingLabel(m.reliability_rating)} />
            <MetricCard label="Vulnerabilidades" value={m.vulnerabilities ?? '—'} accent={parseInt(m.vulnerabilities ?? '0') > 0 ? 'var(--color-critical)' : 'var(--color-success)'} badge={ratingLabel(m.security_rating)} />
            <MetricCard label="Hotspots" value={m.security_hotspots ?? '—'} accent="var(--color-minor)" />
            <MetricCard label="Code Smells" value={m.code_smells ?? '—'} accent="var(--color-major)" badge={ratingLabel(m.sqale_rating)} />
          </div>

          {/* Coverage + duplication bars */}
          <div className="card mb-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <CoverageBar label="Cobertura" value={coverage} goodAbove={true} />
            <CoverageBar label="Duplicación" value={duplication} goodAbove={false} />
          </div>
        </>
      )}

      {/* Issue analytics */}
      {issues && issues.length > 0 && (
        <>
          <h2>Análisis de issues</h2>
          <div className="charts-grid mb-6">
            <IssuesBySeverityChart issues={issues} />
            <IssuesByTypeChart issues={issues} />
            <IssuesByFileChart issues={issues} />
          </div>
        </>
      )}

      {/* Issues list */}
      <div className="card">
        <div className="flex-between mb-4" style={{ flexWrap: 'wrap', gap: 8 }}>
          <h3>
            Issues{' '}
            <span className="text-muted text-sm font-mono">
              ({filteredIssues.length}{issues && filteredIssues.length !== issues.length ? ` / ${issues.length}` : ''})
            </span>
          </h3>
          <div className="flex gap-3 wrap">
            <select
              className="filter-select"
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
            >
              <option value="ALL">Todas las severidades</option>
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="ALL">Todos los tipos</option>
              {issueTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <p>No hay issues con los filtros seleccionados.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Severidad', 'Tipo', 'Mensaje', 'Archivo', 'Esfuerzo', ''].map(h => (
                    <th key={h} style={{ cursor: 'default' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map(issue => (
                  <IssueRow
                    key={issue.key}
                    issue={issue}
                    rule={rules?.[issue.rule]}
                    onClick={() => setSelectedIssue(issue)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedIssue && (
        <IssueDrawer
          issue={selectedIssue}
          rule={rules?.[selectedIssue.rule]}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  )
}
