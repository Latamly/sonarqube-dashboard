import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { Issue } from '../../types/sonarqube'

interface Props {
  issues: Issue[]
}

export default function IssuesByFileChart({ issues }: Props) {
  const counts: Record<string, number> = {}
  for (const issue of issues) {
    const file = issue.component.split(':').pop() ?? issue.component
    counts[file] = (counts[file] ?? 0) + 1
  }

  const data = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([file, count]) => ({
      name: file.length > 30 ? '…' + file.slice(-28) : file,
      count,
    }))

  if (data.length === 0) return null

  return (
    <div className="card">
      <h3 className="mb-4">Top archivos con más issues</h3>
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 32)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 8, bottom: 0 }}>
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={180} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            cursor={{ fill: '#f7f8fc' }}
          />
          <Bar dataKey="count" name="Issues" radius={[0, 3, 3, 0]} maxBarSize={18}>
            {data.map((_, i) => (
              <Cell key={i} fill="#4f6ef7" fillOpacity={1 - i * 0.08} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
