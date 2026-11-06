import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import AnalysisPage from '@/pages/AnalysisPage'
import ResultsPage from '@/pages/ResultsPage'
import KnowledgePage from '@/pages/KnowledgePage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"             element={<HomePage />} />
        <Route path="/analysis"     element={<AnalysisPage />} />
        <Route path="/results/:id"  element={<ResultsPage />} />
        <Route path="/knowledge"    element={<KnowledgePage />} />
      </Route>
    </Routes>
  )
}
