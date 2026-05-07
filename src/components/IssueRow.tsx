import { useState } from 'react'
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
}

export default function IssueRow({ issue, rule }: Props) {
  const [open, setOpen] = useState(false)
  const file = issue.component.split(':').pop() ?? issue.component
  const hasDesc = Boolean(rule?.htmlDesc)
  const severityColor = SEVERITY_COLOR[issue.severity] ?? '#888'

  return (
    <>
      <tr
        className="issue-row"
        onClick={() => hasDesc && setOpen(o => !o)}
        style={{ cursor: hasDesc ? 'pointer' : 'default', borderBottom: '1px solid #eee' }}
      >
        {/* Severidad */}
        <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
          <span style={{
            background: severityColor,
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

        {/* Tipo */}
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

        {/* Mensaje + nombre de regla */}
        <td style={{ padding: '8px 12px' }}>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{issue.message}</span>
          {rule?.name && (
            <span style={{ display: 'block', fontSize: 11, color: '#999', marginTop: 2 }}>
              {rule.name}
            </span>
          )}
        </td>

        {/* Archivo:línea */}
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

        {/* Esfuerzo */}
        <td style={{ padding: '8px 12px', fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
          {issue.effort ? `⏱ ${issue.effort}` : '—'}
        </td>

        {/* Chevron */}
        <td style={{ padding: '8px 12px', fontSize: 14, color: '#aaa', userSelect: 'none', width: 24 }}>
          {hasDesc && (
            <span style={{
              display: 'inline-block',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
              fontWeight: 700,
            }}>›</span>
          )}
        </td>
      </tr>

      {open && rule?.htmlDesc && (
        <tr>
          <td colSpan={6} style={{ background: '#f8f9fb', padding: '14px 20px', borderBottom: '1px solid #ddd' }}>
            <div style={{
              borderLeft: `3px solid ${severityColor}`,
              paddingLeft: 14,
              fontSize: 13,
              color: '#333',
              maxWidth: 900,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <strong style={{ fontSize: 14 }}>{rule.name}</strong>
                {rule.type && (
                  <span style={{ border: '1px solid #ccc', color: '#555', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>
                    {TYPE_LABEL[rule.type] ?? rule.type.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
              <div dangerouslySetInnerHTML={{ __html: rule.htmlDesc }} />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
