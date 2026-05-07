export interface Project {
  key: string
  name: string
  quality_gate?: 'OK' | 'ERROR' | 'NONE'
  metrics?: Record<string, string>
}

export interface Issue {
  key: string
  rule: string
  severity: 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO'
  message: string
  component: string
  line?: number
  type: string
  effort?: string
  textRange?: { startLine: number; endLine: number }
}

export interface Rule {
  name: string
  htmlDesc: string
  severity: string
  type: string
  remFnBaseEffort?: string
}

export interface Meta {
  lastUpdated: string
}
