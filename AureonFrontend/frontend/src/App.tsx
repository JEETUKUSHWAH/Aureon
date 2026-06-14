import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import AuthLayout    from './components/layout/AuthLayout'
import AppLayout     from './components/layout/AppLayout'

import HomePage      from './pages/HomePage'
import LoginPage     from './pages/auth/LoginPage'
import PricingPage   from './pages/PricingPage'
import FeaturesPage  from './pages/FeaturesPage'
import NotFoundPage  from './pages/NotFoundPage'

import DashboardPage    from './pages/dashboard/DashboardPage'
import TransactionsPage from './pages/dashboard/TransactionsPage'
import AccountsPage     from './pages/accounts/AccountsPage'
import CardsPage        from './pages/cards/CardsPage'
import PaymentsPage     from './pages/payments/PaymentsPage'
import VendorsPage      from './pages/payments/VendorsPage'
import InvoicesPage     from './pages/invoices/InvoicesPage'
import ExpensesPage     from './pages/expenses/ExpensesPage'
import WorkflowsPage    from './pages/workflows/WorkflowsPage'
import AnalyticsPage    from './pages/analytics/AnalyticsPage'
import SettingsPage     from './pages/settings/SettingsPage'
import TeamPage         from './pages/dashboard/TeamPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#fff',
              color: '#1E293B',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public Marketing */}
          <Route path="/"         element={<HomePage/>}/>
          <Route path="/pricing"  element={<PricingPage/>}/>
          <Route path="/features" element={<FeaturesPage/>}/>

          {/* Auth */}
          <Route element={<PublicRoute><AuthLayout/></PublicRoute>}>
            <Route path="/login"  element={<LoginPage/>}/>
            <Route path="/signup" element={<LoginPage/>}/>
          </Route>

          {/* Protected App */}
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout/></ProtectedRoute>}>
            <Route index                  element={<DashboardPage/>}/>
            <Route path="transactions"    element={<TransactionsPage/>}/>
            <Route path="cards"           element={<CardsPage/>}/>
            <Route path="invoicing"       element={<InvoicesPage/>}/>
            <Route path="expenses"        element={<ExpensesPage/>}/>
            <Route path="account"         element={<AccountsPage/>}/>
            <Route path="payments"        element={<PaymentsPage/>}/>
            <Route path="vendors"         element={<VendorsPage/>}/>
            <Route path="analytics"       element={<AnalyticsPage/>}/>
            <Route path="settings"        element={<SettingsPage/>}/>
            {/* Placeholder aliases */}
            <Route path="team"            element={<TeamPage/>}/>
            <Route path="audit"           element={<DashboardPage/>}/>
          </Route>

          <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
      </AuthProvider>
    </Router>
  )
}
