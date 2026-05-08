import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { Project } from '../../types/sonarqube'

interface Props {
  projects: Project[]
}

const METRICS = [
  { key: 'bugs', label: 'Bugs', color: '#d4333f' },
  { key: 'vulnerabilities', label: 'Vulnerabilidades', color: '#f06600' },
  { key: 'code_smells', label: 'Code Smells', color: '#e6a817' },
  { key: 'security_hotspots', label: 'Hotspots', color: '#4c9be8' },
]

export default function MetricsBarChart({ projects }: Props) {
  const data = projects.map(p => ({
    name: p.name.length > 20 ? p.name.slice(0, 18) + '…' : p.name,
    bugs: parseInt(p.metrics?.bugs ?? '0'),
    vulnerabilities: parseInt(p.metrics?.vulnerabilities ?? '0'),
    code_smells: parseInt(p.metrics?.code_smells ?? '0'),
    security_hotspots: parseInt(p.metrics?.security_hotspots ?? '0'),
  }))

  return (
    <div className="card">
      <h3 className="mb-4">Comparación de métricas</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            cursor={{ fill: '#f7f8fc' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {METRICS.map(m => (
            <Bar key={m.key} dataKey={m.key} name={m.label} fill={m.color} radius={[3, 3, 0, 0]} maxBarSize={32} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
