import { HashRouter, Routes, Route } from 'react-router-dom'
import ProjectsTable from './components/ProjectsTable'
import ProjectDetail from './components/ProjectDetail'
import Navbar from './components/layout/Navbar'
import './index.css'

export default function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProjectsTable />} />
        <Route path="/project/:key" element={<ProjectDetail />} />
      </Routes>
    </HashRouter>
  )
}
