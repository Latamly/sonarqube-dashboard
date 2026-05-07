export interface Project {
  key: string
  name: string
  quality_gate?: 'OK' | 'ERROR' | 'NONE'
  metrics?: Record<string, string>
}

export interface CodeLine {
  line: number
  code: string
}

export interface IssueComment {
  key: string
  login: string
  htmlText: string
  createdAt: string
}

export interface IssueFlow {
  locations: Array<{
    component: string
    msg?: string
    textRange?: { startLine: number; endLine: number }
  }>
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
  textRange?: { startLine: number; endLine: number; startOffset: number; endOffset: number }
  tags?: string[]
  flows?: IssueFlow[]
  comments?: IssueComment[]
  codeSnippet?: CodeLine[]
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
