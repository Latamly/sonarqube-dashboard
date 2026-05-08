import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { Project } from '../../types/sonarqube'

interface Props {
  projects: Project[]
}

const COLORS = { OK: '#1ea64b', ERROR: '#d4333f', NONE: '#9ca3af' }
const LABELS = { OK: 'Passed', ERROR: 'Failed', NONE: 'Unknown' }

export default function QualityGateChart({ projects }: Props) {
  const counts: Record<string, number> = { OK: 0, ERROR: 0, NONE: 0 }
  for (const p of projects) {
    const gate = p.quality_gate ?? 'NONE'
    counts[gate] = (counts[gate] ?? 0) + 1
  }

  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: LABELS[key as keyof typeof LABELS] ?? key, value, key }))

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 className="mb-4" style={{ alignSelf: 'flex-start' }}>Quality Gate</h3>
      <PieChart width={220} height={180}>
        <Pie
          data={data}
          cx={110}
          cy={80}
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
          label={({ name, value }) => `${name} (${value})`}
          labelLine={false}
        >
          {data.map(entry => (
            <Cell key={entry.key} fill={COLORS[entry.key as keyof typeof COLORS] ?? '#9ca3af'} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
      </PieChart>
    </div>
  )
}
