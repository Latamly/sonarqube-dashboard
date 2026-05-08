import type { Issue, Rule } from '../types/sonarqube'

const SEVERITY_COLOR: Record<string, string> = {
  BLOCKER:  '#d4333f',
  CRITICAL: '#f06600',
  MAJOR:    '#ffaa00',
  MINOR:    '#4c9be8',
  INFO:     '#888',
}

const TYPE_LABEL: Record<string, string> = {
  BUG:              'Bug',
  VULNERABILITY:    'Vulnerability',
  SECURITY_HOTSPOT: 'Hotspot',
  CODE_SMELL:       'Code Smell',
}

interface Props {
  issue: Issue
  rule?: Rule
  onClick: () => void
}

export default function IssueRow({ issue, rule, onClick }: Props) {
  const file = issue.component.split(':').pop() ?? issue.component

  return (
    <tr
      className="issue-row"
      onClick={onClick}
      style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
    >
      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
        <span style={{
          background: SEVERITY_COLOR[issue.severity] ?? '#888',
          color: '#fff',
          padding: '2px 8px',
          borderRadius: 3,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}>
          {issue.severity}
        </span>
      </td>

      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
        <span style={{
          border: '1px solid #ccc',
          color: '#555',
          padding: '2px 7px',
          borderRadius: 3,
          fontSize: 11,
          fontWeight: 500,
        }}>
          {TYPE_LABEL[issue.type] ?? issue.type.replace(/_/g, ' ')}
        </span>
      </td>

      <td style={{ padding: '8px 12px' }}>
        <span style={{ fontWeight: 500, fontSize: 14 }}>{issue.message}</span>
        {rule?.name && (
          <span style={{ display: 'block', fontSize: 11, color: '#999', marginTop: 2 }}>
            {rule.name}
          </span>
        )}
      </td>

      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
        <code style={{
          background: '#f0f0f0',
          borderRadius: 3,
          padding: '2px 6px',
          fontSize: 12,
          color: '#333',
        }}>
          {file}{issue.line != null ? <><span style={{ color: '#aaa' }}>:</span>{issue.line}</> : ''}
        </code>
      </td>

      <td style={{ padding: '8px 12px', fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
        {issue.effort ? `⏱ ${issue.effort}` : '—'}
      </td>

      <td style={{ padding: '8px 12px', fontSize: 14, color: '#aaa', userSelect: 'none', width: 24 }}>
        <span style={{ fontWeight: 700 }}>›</span>
      </td>
    </tr>
  )
}
