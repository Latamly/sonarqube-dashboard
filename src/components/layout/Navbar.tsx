import { useJson } from '../../hooks/useSonarData'
import type { Meta } from '../../types/sonarqube'

export default function Navbar() {
  const { data: meta } = useJson<Meta>('data/meta.json')

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">SQ</span>
        SonarQube Dashboard
      </div>
      {meta && (
        <span className="text-sm text-muted">
          Actualizado: {new Date(meta.lastUpdated).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      )}
    </nav>
  )
}
