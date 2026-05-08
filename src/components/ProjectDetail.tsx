import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJson } from '../hooks/useSonarData'
import type { Issue, Rule, Project } from '../types/sonarqube'
import RatingBadge from './RatingBadge'
import QualityGateBadge from './QualityGateBadge'
import IssueRow from './IssueRow'
import IssueDrawer from './IssueDrawer'

function ratingLabel(raw?: string): string {
  const n = parseInt(raw ?? '0')
  return ['', 'A', 'B', 'C', 'D', 'E'][n] ?? '—'
}

const SEVERITIES = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO']

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

  if (ml || il) return <p style={{ padding: 32 }}>Cargando…</p>

  return (
    <div style={{ padding: 32 }}>
      <button
        onClick={() => navigate('/')}
        style={{ marginBottom: 20, padding: '6px 16px', cursor: 'pointer', fontSize: 14 }}
      >
        ← Volver
      </button>

      <h1 style={{ margin: '0 0 4px' }}>{project?.name ?? decoded}</h1>
      <p style={{ margin: '0 0 24px', color: '#888', fontFamily: 'monospace', fontSize: 13 }}>{decoded}</p>

      {metrics && (
        <>
          <div style={{ marginBottom: 8 }}>
            <QualityGateBadge value={project?.quality_gate} />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { label: 'Bugs', value: metrics.bugs },
              { label: 'Vulnerabilidades', value: metrics.vulnerabilities },
              { label: 'Hotspots', value: metrics.security_hotspots },
              { label: 'Code Smells', value: metrics.code_smells },
              { label: 'Cobertura', value: metrics.coverage ? `${parseFloat(metrics.coverage).toFixed(1)}%` : '—' },
              { label: 'Duplicación', value: metrics.duplicated_lines_density ? `${parseFloat(metrics.duplicated_lines_density).toFixed(1)}%` : '—' },
            ].map(c => (
              <div key={c.label} style={{ background: '#f4f4f4', borderRadius: 6, padding: '12px 20px', minWidth: 110, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{c.value ?? '—'}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{c.label}</div>
              </div>
            ))}
            {[
              { label: 'Reliability', value: ratingLabel(metrics.reliability_rating) },
              { label: 'Security', value: ratingLabel(metrics.security_rating) },
              { label: 'Maintainability', value: ratingLabel(metrics.sqale_rating) },
            ].map(c => (
              <div key={c.label} style={{ background: '#f4f4f4', borderRadius: 6, padding: '12px 20px', minWidth: 110, textAlign: 'center' }}>
                <div style={{ marginTop: 2 }}><RatingBadge value={c.value} /></div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 style={{ marginBottom: 16 }}>Issues ({filteredIssues.length}{issues && filteredIssues.length !== issues.length ? ` de ${issues.length}` : ''})</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={{ padding: '6px 10px', fontSize: 13 }}>
          <option value="ALL">Todas las severidades</option>
          {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '6px 10px', fontSize: 13 }}>
          <option value="ALL">Todos los tipos</option>
          {issueTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {filteredIssues.length === 0 ? (
        <p style={{ color: '#888' }}>No hay issues con los filtros seleccionados.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                {['Severidad', 'Tipo', 'Mensaje', 'Archivo', 'Esfuerzo', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map(issue => (
                <IssueRow key={issue.key} issue={issue} rule={rules?.[issue.rule]} onClick={() => setSelectedIssue(issue)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

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
