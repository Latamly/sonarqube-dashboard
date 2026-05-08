import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { Issue } from '../../types/sonarqube'

interface Props {
  issues: Issue[]
}

const SEVERITY_COLOR: Record<string, string> = {
  BLOCKER: '#d4333f',
  CRITICAL: '#f06600',
  MAJOR: '#e6a817',
  MINOR: '#4c9be8',
  INFO: '#9ca3af',
}

const ORDER = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO']

export default function IssuesBySeverityChart({ issues }: Props) {
  const counts: Record<string, number> = {}
  for (const issue of issues) {
    counts[issue.severity] = (counts[issue.severity] ?? 0) + 1
  }

  const data = ORDER
    .filter(s => (counts[s] ?? 0) > 0)
    .map(s => ({ name: s, count: counts[s] }))

  if (data.length === 0) return null

  return (
    <div className="card">
      <h3 className="mb-4">Issues por severidad</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 16, bottom: 0 }}>
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            cursor={{ fill: '#f7f8fc' }}
          />
          <Bar dataKey="count" name="Issues" radius={[0, 3, 3, 0]} maxBarSize={22}>
            {data.map(entry => (
              <Cell key={entry.name} fill={SEVERITY_COLOR[entry.name] ?? '#9ca3af'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
