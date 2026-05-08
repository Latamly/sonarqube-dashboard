import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import type { Issue } from '../../types/sonarqube'

interface Props {
  issues: Issue[]
}

const TYPE_COLOR: Record<string, string> = {
  BUG: '#d4333f',
  VULNERABILITY: '#f06600',
  SECURITY_HOTSPOT: '#4c9be8',
  CODE_SMELL: '#e6a817',
}

const TYPE_LABEL: Record<string, string> = {
  BUG: 'Bug',
  VULNERABILITY: 'Vulnerability',
  SECURITY_HOTSPOT: 'Hotspot',
  CODE_SMELL: 'Code Smell',
}

export default function IssuesByTypeChart({ issues }: Props) {
  const counts: Record<string, number> = {}
  for (const issue of issues) {
    counts[issue.type] = (counts[issue.type] ?? 0) + 1
  }

  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: TYPE_LABEL[key] ?? key, value, key }))

  if (data.length === 0) return null

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 className="mb-4" style={{ alignSelf: 'flex-start' }}>Issues por tipo</h3>
      <PieChart width={240} height={200}>
        <Pie
          data={data}
          cx={120}
          cy={85}
          innerRadius={45}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map(entry => (
            <Cell key={entry.key} fill={TYPE_COLOR[entry.key] ?? '#9ca3af'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(value, name) => [value, name]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </div>
  )
}
