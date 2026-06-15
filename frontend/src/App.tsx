import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { FamilyTreePage } from './pages/FamilyTreePage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MainLayout } from './components/Layout/MainLayout'
import { useAuthStore } from './store/useAuthStore'

import { AdminPage } from './pages/AdminPage'
import { EventsPage } from './pages/EventsPage'
import { HierarchyPage } from './pages/HierarchyPage'
import { HistoryPage } from './pages/HistoryPage'
import { LandingPage } from './pages/LandingPage'

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/tree" />} />
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="tree" element={<FamilyTreePage />} />
          <Route path="hierarchy" element={<HierarchyPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="events" element={<EventsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
