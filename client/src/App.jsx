import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import RegistrationFlow from './pages/RegistrationFlow'
import Onboarding from './pages/Onboarding'
import DocumentUpload from './pages/DocumentUpload'
import VerificationStatus from './pages/VerificationStatus'
import DocumentHelp from './pages/DocumentHelp'
import Dashboard from './pages/Dashboard'
import ComplianceList from './pages/ComplianceList'
import ComplianceForm from './pages/ComplianceForm'
import ComplianceDetail from './pages/ComplianceDetail'
import Templates from './pages/Templates'
import Reports from './pages/Reports'
import Alerts from './pages/Alerts'
import RiskAssessment from './pages/RiskAssessment'
import Users from './pages/Users'
import Contracts from './pages/Contracts'
import Settings from './pages/Settings'
import ComplianceSetup from './pages/ComplianceSetup'
import CompanyReport from './pages/CompanyReport'

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegistrationFlow />} />
      <Route path="/register/old" element={<Register />} />
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />
      <Route path="/register/documents" element={
        <ProtectedRoute>
          <DocumentUpload />
        </ProtectedRoute>
      } />
      <Route path="/verification-status" element={
        <ProtectedRoute>
          <VerificationStatus />
        </ProtectedRoute>
      } />
      <Route path="/register/help" element={
        <ProtectedRoute>
          <DocumentHelp />
        </ProtectedRoute>
      } />
      <Route path="/compliance-setup" element={
        <ProtectedRoute>
          <ComplianceSetup />
        </ProtectedRoute>
      } />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/compliance" element={<ComplianceList />} />
        <Route path="/compliance/new" element={<ComplianceForm />} />
        <Route path="/compliance/:id" element={<ComplianceDetail />} />
        <Route path="/compliance/:id/edit" element={<ComplianceForm />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/risks" element={<RiskAssessment />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/company-report" element={<CompanyReport />} />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Users />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
