import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJson } from '../hooks/useSonarData'
import type { Project } from '../types/sonarqube'
import QualityGateBadge from './QualityGateBadge'
import RatingBadge from './RatingBadge'
import SummaryCards from './SummaryCards'
import MetricsBarChart from './charts/MetricsBarChart'
import QualityGateChart from './charts/QualityGateChart'

type SortField = 'name' | 'bugs' | 'vulnerabilities' | 'code_smells' | 'security_hotspots' | 'coverage' | 'duplicated_lines_density'
type SortDir = 'asc' | 'desc'

function ratingLabel(raw?: string): string {
  const n = parseInt(raw ?? '0')
  return ['', 'A', 'B', 'C', 'D', 'E'][n] ?? '—'
}

function parseNum(v?: string) { return parseFloat(v ?? '0') || 0 }

const COLUMNS: { key: SortField | 'quality_gate' | 'reliability' | 'security' | 'maintainability'; label: string; sortable?: SortField }[] = [
  { key: 'name', label: 'Proyecto', sortable: 'name' },
  { key: 'quality_gate', label: 'Quality Gate' },
  { key: 'bugs', label: 'Bugs', sortable: 'bugs' },
  { key: 'vulnerabilities', label: 'Vulns', sortable: 'vulnerabilities' },
  { key: 'security_hotspots', label: 'Hotspots', sortable: 'security_hotspots' },
  { key: 'code_smells', label: 'Code Smells', sortable: 'code_smells' },
  { key: 'coverage', label: 'Cobertura', sortable: 'coverage' },
  { key: 'duplicated_lines_density', label: 'Duplicación', sortable: 'duplicated_lines_density' },
  { key: 'reliability', label: 'Reliability' },
  { key: 'security', label: 'Security' },
  { key: 'maintainability', label: 'Maint.' },
]

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span style={{ color: '#ccc', marginLeft: 4 }}>↕</span>
  return <span style={{ marginLeft: 4 }}>{dir === 'asc' ? '↑' : '↓'}</span>
}

function CoverageBar({ value }: { value: number }) {
  const color = value >= 80 ? 'var(--color-success)' : value >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="progress-bar-track" style={{ width: 56 }}>
        <div className="progress-bar-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, minWidth: 36 }}>{value.toFixed(1)}%</span>
    </div>
  )
}

export default function ProjectsTable() {
  const navigate = useNavigate()
  const { data: projects, loading, error } = useJson<Project[]>('data/projects.json')

  const [search, setSearch] = useState('')
  const [gateFilter, setGateFilter] = useState<'ALL' | 'OK' | 'ERROR'>('ALL')
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'bugs', dir: 'desc' })

  const filtered = useMemo(() => {
    if (!projects) return []
    let list = projects.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      if (gateFilter !== 'ALL' && p.quality_gate !== gateFilter) return false
      return true
    })
    list = [...list].sort((a, b) => {
      const av = sort.field === 'name' ? a.name : parseNum(a.metrics?.[sort.field])
      const bv = sort.field === 'name' ? b.name : parseNum(b.metrics?.[sort.field])
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return list
  }, [projects, search, gateFilter, sort])

  function toggleSort(field: SortField) {
    setSort(prev => prev.field === field ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'desc' })
  }

  if (loading) return <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Cargando proyectos…</p></div>
  if (error) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><p>Error: {error}</p></div>
  if (!projects?.length) return <div className="empty-state"><div className="empty-state-icon">📭</div><p>No hay proyectos.</p></div>

  return (
    <div className="page">
      {/* Summary KPIs */}
      <SummaryCards projects={projects} />

      {/* Charts */}
      <div className="charts-grid mt-6">
        <MetricsBarChart projects={projects} />
        <QualityGateChart projects={projects} />
      </div>

      {/* Table section */}
      <div className="card mt-6">
        <div className="flex-between mb-4" style={{ flexWrap: 'wrap', gap: 8 }}>
          <h3>Todos los proyectos</h3>
          <div className="flex gap-3 wrap" style={{ alignItems: 'center' }}>
            {/* Search */}
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Buscar proyecto…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Gate filter */}
            <div className="flex gap-2">
              {(['ALL', 'OK', 'ERROR'] as const).map(g => (
                <button
                  key={g}
                  className={`filter-pill ${gateFilter === g ? 'active' : ''}`}
                  onClick={() => setGateFilter(g)}
                >
                  {g === 'ALL' ? 'Todos' : g === 'OK' ? '✓ Passed' : '✕ Failed'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔎</div>
            <p>Sin resultados para los filtros actuales.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {COLUMNS.map(col => (
                    <th
                      key={col.key}
                      onClick={col.sortable ? () => toggleSort(col.sortable!) : undefined}
                      style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                    >
                      {col.label}
                      {col.sortable && <SortIcon active={sort.field === col.sortable} dir={sort.dir} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const m = p.metrics ?? {}
                  const coverage = parseNum(m.coverage)
                  const duplication = parseNum(m.duplicated_lines_density)
                  return (
                    <tr key={p.key} onClick={() => navigate(`/project/${encodeURIComponent(p.key)}`)}>
                      <td>
                        <span className="font-semibold">{p.name}</span>
                        <div className="font-mono text-xs text-muted" style={{ marginTop: 2 }}>{p.key}</div>
                      </td>
                      <td><QualityGateBadge value={p.quality_gate} /></td>
                      <td>
                        <span style={{ color: parseInt(m.bugs ?? '0') > 0 ? 'var(--color-blocker)' : undefined, fontWeight: parseInt(m.bugs ?? '0') > 0 ? 700 : undefined }}>
                          {m.bugs ?? '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: parseInt(m.vulnerabilities ?? '0') > 0 ? 'var(--color-critical)' : undefined, fontWeight: parseInt(m.vulnerabilities ?? '0') > 0 ? 700 : undefined }}>
                          {m.vulnerabilities ?? '—'}
                        </span>
                      </td>
                      <td>{m.security_hotspots ?? '—'}</td>
                      <td>{m.code_smells ?? '—'}</td>
                      <td><CoverageBar value={coverage} /></td>
                      <td>
                        <span style={{ color: duplication > 10 ? 'var(--color-danger)' : duplication > 3 ? 'var(--color-warning)' : undefined }}>
                          {duplication.toFixed(1)}%
                        </span>
                      </td>
                      <td><RatingBadge value={ratingLabel(m.reliability_rating)} /></td>
                      <td><RatingBadge value={ratingLabel(m.security_rating)} /></td>
                      <td><RatingBadge value={ratingLabel(m.sqale_rating)} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
