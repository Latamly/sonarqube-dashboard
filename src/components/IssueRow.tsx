import { useState } from 'react'
import type { Issue, Rule } from '../types/sonarqube'

const SEVERITY_COLOR: Record<string, string> = {
  BLOCKER:  '#d4333f',
  CRITICAL: '#f06600',
  MAJOR:    '#ffaa00',
  MINOR:    '#4c9be8',
  INFO:     '#888',
}

interface Props {
  issue: Issue
  rule?: Rule
}

export default function IssueRow({ issue, rule }: Props) {
  const [open, setOpen] = useState(false)
  const file = issue.component.split(':').pop() ?? issue.component

  return (
    <>
      <tr
        onClick={() => setOpen(o => !o)}
        style={{ cursor: rule?.htmlDesc ? 'pointer' : 'default', borderBottom: '1px solid #eee' }}
      >
        <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
          <span style={{
            background: SEVERITY_COLOR[issue.severity] ?? '#888',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 3,
            fontSize: 12,
            fontWeight: 600,
          }}>
            {issue.severity}
          </span>
        </td>
        <td style={{ padding: '8px 12px', color: '#555', fontSize: 12 }}>{issue.type.replace(/_/g, ' ')}</td>
        <td style={{ padding: '8px 12px' }}>{issue.message}</td>
        <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: '#555' }}>
          {file}{issue.line ? `:${issue.line}` : ''}
        </td>
        <td style={{ padding: '8px 12px', fontSize: 12, color: '#888' }}>{issue.effort ?? '—'}</td>
        <td style={{ padding: '8px 12px', fontSize: 18, color: '#aaa', userSelect: 'none' }}>
          {rule?.htmlDesc ? (open ? '▲' : '▼') : ''}
        </td>
      </tr>
      {open && rule?.htmlDesc && (
        <tr>
          <td colSpan={6} style={{ background: '#f8f9fb', padding: '12px 20px', borderBottom: '1px solid #ddd' }}>
            <div style={{ fontSize: 13, color: '#333', maxWidth: 900 }}>
              <strong style={{ display: 'block', marginBottom: 6 }}>
                {rule.name}
              </strong>
              <div dangerouslySetInnerHTML={{ __html: rule.htmlDesc }} />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
