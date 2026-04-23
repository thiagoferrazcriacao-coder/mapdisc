import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AppAuthProvider'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EmployeesPage from './pages/EmployeesPage'
import EmployeeDetailPage from './pages/EmployeeDetailPage'
import InvitationsPage from './pages/InvitationsPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/:id" element={<EmployeeDetailPage />} />
          <Route path="invitations" element={<InvitationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}