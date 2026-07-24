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
import DeveloperDashboard from './pages/DeveloperDashboard'
import DeveloperOrganizationDetails from './pages/DeveloperOrganizationDetails'
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
import Notices from './pages/Notices'
import Questionnaire from './pages/Questionnaire'
import SectorPdfs from './pages/SectorPdfs'
import ContactSupport from './pages/ContactSupport'

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function DeveloperRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'developer' && user?.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function CompanyAdminRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'developer') {
    return <Navigate to="/developer" replace />
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
      <Route path="/contact-support" element={
        <ProtectedRoute>
          <ContactSupport />
        </ProtectedRoute>
      } />
      <Route path="/compliance-setup" element={
        <ProtectedRoute>
          <ComplianceSetup />
        </ProtectedRoute>
      } />
      <Route path="/questionnaire" element={
        <ProtectedRoute>
          <Questionnaire />
        </ProtectedRoute>
      } />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={
          <CompanyAdminRoute>
            <Dashboard />
          </CompanyAdminRoute>
        } />
        <Route path="/developer" element={
          <DeveloperRoute>
            <DeveloperDashboard />
          </DeveloperRoute>
        } />
        <Route path="/developer/organizations/:id" element={
          <DeveloperRoute>
            <DeveloperOrganizationDetails />
          </DeveloperRoute>
        } />
        <Route path="/compliance" element={<ComplianceList />} />
        <Route path="/compliance/new" element={<ComplianceForm />} />
        <Route path="/compliance/:id" element={<ComplianceDetail />} />
        <Route path="/compliance/:id/edit" element={<ComplianceForm />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/questionnaire" element={
          <ProtectedRoute>
            <Questionnaire />
          </ProtectedRoute>
        } />
        <Route path="/sector-pdfs" element={<SectorPdfs />} />
        <Route path="/risks" element={<RiskAssessment />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/company-report" element={<CompanyReport />} />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin', 'developer']}>
            <Users />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
