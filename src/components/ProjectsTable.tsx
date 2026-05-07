import { useNavigate } from 'react-router-dom'
import { useJson } from '../hooks/useSonarData'
import type { Project, Meta } from '../types/sonarqube'
import QualityGateBadge from './QualityGateBadge'
import RatingBadge from './RatingBadge'

function ratingLabel(raw?: string): string {
  const n = parseInt(raw ?? '0')
  return ['', 'A', 'B', 'C', 'D', 'E'][n] ?? '—'
}

export default function ProjectsTable() {
  const navigate = useNavigate()
  const { data: projects, loading, error } = useJson<Project[]>('data/projects.json')
  const { data: meta } = useJson<Meta>('data/meta.json')

  if (loading) return <p style={{ padding: 32 }}>Cargando proyectos…</p>
  if (error) return <p style={{ padding: 32, color: 'red' }}>Error: {error}</p>
  if (!projects?.length) return <p style={{ padding: 32 }}>No hay proyectos.</p>

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>SonarQube Dashboard</h1>
        {meta && (
          <span style={{ color: '#888', fontSize: 13 }}>
            Última actualización: {new Date(meta.lastUpdated).toLocaleString()}
          </span>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
              {['Proyecto', 'Quality Gate', 'Bugs', 'Vulns', 'Hotspots', 'Code Smells', 'Cobertura', 'Duplicación', 'Reliability', 'Security', 'Maintainability'].map(h => (
                <th key={h} style={{ padding: '10px 14px', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => {
              const m = p.metrics ?? {}
              return (
                <tr
                  key={p.key}
                  onClick={() => navigate(`/project/${encodeURIComponent(p.key)}`)}
                  style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#eef4ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}
                >
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #eee', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}><QualityGateBadge value={p.quality_gate} /></td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}>{m.bugs ?? '—'}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}>{m.vulnerabilities ?? '—'}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}>{m.security_hotspots ?? '—'}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}>{m.code_smells ?? '—'}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}>{m.coverage ? `${parseFloat(m.coverage).toFixed(1)}%` : '—'}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}>{m.duplicated_lines_density ? `${parseFloat(m.duplicated_lines_density).toFixed(1)}%` : '—'}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}><RatingBadge value={ratingLabel(m.reliability_rating)} /></td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}><RatingBadge value={ratingLabel(m.security_rating)} /></td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}><RatingBadge value={ratingLabel(m.sqale_rating)} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
