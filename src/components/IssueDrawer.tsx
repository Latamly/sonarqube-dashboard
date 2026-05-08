import { useEffect } from 'react'
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
  onClose: () => void
}

export default function IssueDrawer({ issue, rule, onClose }: Props) {
  const file = issue.component.split(':').pop() ?? issue.component
  const severityColor = SEVERITY_COLOR[issue.severity] ?? '#888'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 100,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(680px, 100vw)',
        background: '#fff',
        zIndex: 101,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{
                background: severityColor,
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 3,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}>
                {issue.severity}
              </span>
              <span style={{
                border: '1px solid #ccc',
                color: '#555',
                padding: '1px 7px',
                borderRadius: 3,
                fontSize: 11,
                fontWeight: 500,
                flexShrink: 0,
              }}>
                {TYPE_LABEL[issue.type] ?? issue.type.replace(/_/g, ' ')}
              </span>
              {issue.effort && (
                <span style={{ fontSize: 12, color: '#888', flexShrink: 0 }}>⏱ {issue.effort}</span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111', lineHeight: 1.4 }}>
              {issue.message}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 20, color: '#888', padding: '0 4px', lineHeight: 1,
              flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* File location */}
        <div style={{
          padding: '8px 20px',
          background: '#f8f9fb',
          borderBottom: '1px solid #e5e7eb',
          fontSize: 12,
          color: '#555',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ color: '#888' }}>📄</span>
          <code style={{ color: '#333' }}>
            {file}{issue.line != null ? `:${issue.line}` : ''}
          </code>
          <span style={{ color: '#ccc', marginLeft: 4 }}>{issue.component}</span>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* Code snippet */}
          {issue.codeSnippet && issue.codeSnippet.length > 0 && (
            <div style={{ borderBottom: '1px solid #e5e7eb' }}>
              <pre style={{
                margin: 0,
                background: '#1e1e1e',
                color: '#d4d4d4',
                fontSize: 13,
                lineHeight: 1.7,
                overflowX: 'auto',
                padding: '16px 0',
              }}>
                {issue.codeSnippet.map(({ line, code }) => {
                  const isIssueLine = line === issue.line
                  return (
                    <div
                      key={line}
                      style={{
                        display: 'flex',
                        background: isIssueLine ? 'rgba(255,170,0,0.12)' : undefined,
                        borderLeft: isIssueLine ? `3px solid ${severityColor}` : '3px solid transparent',
                        paddingRight: 24,
                      }}
                    >
                      <span style={{
                        color: '#555',
                        userSelect: 'none',
                        minWidth: 48,
                        textAlign: 'right',
                        paddingRight: 16,
                        paddingLeft: 12,
                        flexShrink: 0,
                        fontSize: 12,
                      }}>
                        {line}
                      </span>
                      <span style={{ whiteSpace: 'pre' }}>{code}</span>
                    </div>
                  )
                })}
              </pre>
              {/* Issue marker below the highlighted line */}
              {issue.line != null && (
                <div style={{
                  background: '#1e1e1e',
                  paddingBottom: 16,
                  paddingLeft: 64,
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: severityColor,
                    color: '#fff',
                    borderRadius: 4,
                    padding: '3px 10px',
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                    <span>↑</span>
                    <span>{issue.message}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rule description */}
          {rule?.htmlDesc && (
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 14, color: '#111' }}>{rule.name}</strong>
                {issue.tags?.map(tag => (
                  <span key={tag} style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    padding: '1px 8px',
                    borderRadius: 10,
                    fontSize: 11,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div
                className="rule-desc"
                style={{ fontSize: 13, color: '#333', lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: rule.htmlDesc }}
              />
            </div>
          )}

          {/* Flows */}
          {issue.flows && issue.flows.length > 0 && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Flujos secundarios
              </div>
              {issue.flows.map((flow, fi) => (
                <div key={fi} style={{ marginBottom: 8 }}>
                  {flow.locations.map((loc, li) => (
                    <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', marginLeft: li * 16 }}>
                      <span style={{ color: '#aaa', fontSize: 12 }}>→</span>
                      <code style={{ background: '#f0f0f0', padding: '1px 6px', borderRadius: 3, fontSize: 12 }}>
                        {loc.component.split(':').pop()}{loc.textRange ? `:${loc.textRange.startLine}` : ''}
                      </code>
                      {loc.msg && <span style={{ fontSize: 12, color: '#666' }}>{loc.msg}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Comments */}
          {issue.comments && issue.comments.length > 0 && (
            <div style={{ padding: '16px 24px' }}>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Comentarios ({issue.comments.length})
              </div>
              {issue.comments.map(c => (
                <div key={c.key} style={{
                  marginBottom: 12,
                  background: '#f8f9fb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '10px 14px',
                }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <strong style={{ fontSize: 12 }}>{c.login}</strong>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#333' }} dangerouslySetInnerHTML={{ __html: c.htmlText }} />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
