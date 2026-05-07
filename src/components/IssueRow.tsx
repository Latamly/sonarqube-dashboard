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
  const hasDetail = Boolean(rule?.htmlDesc || issue.codeSnippet?.length || issue.tags?.length || issue.flows?.length || issue.comments?.length)
  const severityColor = SEVERITY_COLOR[issue.severity] ?? '#888'

  return (
    <>
      <tr
        className="issue-row"
        onClick={() => hasDetail && setOpen(o => !o)}
        style={{ cursor: hasDetail ? 'pointer' : 'default', borderBottom: '1px solid #eee' }}
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
          {hasDetail && (
            <span style={{
              display: 'inline-block',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
              fontWeight: 700,
            }}>›</span>
          )}
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={6} style={{ background: '#f8f9fb', padding: '16px 20px', borderBottom: '1px solid #ddd' }}>
            <div style={{ borderLeft: `3px solid ${severityColor}`, paddingLeft: 16, maxWidth: 960 }}>

              {/* Cabecera: nombre de regla + tipo + tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {rule?.name && <strong style={{ fontSize: 14 }}>{rule.name}</strong>}
                {rule?.type && (
                  <span style={{ border: '1px solid #ccc', color: '#555', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>
                    {TYPE_LABEL[rule.type] ?? rule.type.replace(/_/g, ' ')}
                  </span>
                )}
                {issue.tags?.map(tag => (
                  <span key={tag} style={{ background: '#e8f0fe', color: '#1a56db', padding: '1px 7px', borderRadius: 10, fontSize: 11 }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Snippet de código */}
              {issue.codeSnippet && issue.codeSnippet.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Código
                  </div>
                  <pre style={{
                    margin: 0,
                    background: '#1e1e1e',
                    color: '#d4d4d4',
                    borderRadius: 6,
                    padding: '12px 16px',
                    fontSize: 12,
                    overflowX: 'auto',
                    lineHeight: 1.6,
                  }}>
                    {issue.codeSnippet.map(({ line, code }) => (
                      <div
                        key={line}
                        style={{
                          background: line === issue.line ? 'rgba(255,200,0,0.15)' : undefined,
                          borderLeft: line === issue.line ? '3px solid #ffaa00' : '3px solid transparent',
                          paddingLeft: 8,
                          marginLeft: -8,
                        }}
                      >
                        <span style={{ color: '#858585', userSelect: 'none', marginRight: 16, display: 'inline-block', minWidth: 28, textAlign: 'right' }}>
                          {line}
                        </span>
                        {code}
                      </div>
                    ))}
                  </pre>
                </div>
              )}

              {/* Descripción de la regla */}
              {rule?.htmlDesc && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Por qué es un problema / Cómo solucionarlo
                  </div>
                  <div style={{ fontSize: 13, color: '#333' }} dangerouslySetInnerHTML={{ __html: rule.htmlDesc }} />
                </div>
              )}

              {/* Flujos secundarios */}
              {issue.flows && issue.flows.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Flujos secundarios
                  </div>
                  {issue.flows.map((flow, fi) => (
                    <div key={fi} style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                      {flow.locations.map((loc, li) => (
                        <div key={li} style={{ marginLeft: li * 12, padding: '2px 0' }}>
                          <code style={{ background: '#f0f0f0', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>
                            {loc.component.split(':').pop()}{loc.textRange ? `:${loc.textRange.startLine}` : ''}
                          </code>
                          {loc.msg && <span style={{ marginLeft: 8, color: '#666' }}>{loc.msg}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Comentarios */}
              {issue.comments && issue.comments.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Comentarios ({issue.comments.length})
                  </div>
                  {issue.comments.map(c => (
                    <div key={c.key} style={{ marginBottom: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ fontSize: 12 }}>{c.login}</strong>
                        <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#333' }} dangerouslySetInnerHTML={{ __html: c.htmlText }} />
                    </div>
                  ))}
                </div>
              )}

            </div>
          </td>
        </tr>
      )}
    </>
  )
}
