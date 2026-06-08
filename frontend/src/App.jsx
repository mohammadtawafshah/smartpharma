import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Public pages
import HomePage          from './pages/public/HomePage'
import DrugsPage         from './pages/public/DrugsPage'
import HerbsPage         from './pages/public/HerbsPage'
import DrugDetailPage    from './pages/public/DrugDetailPage'
import HerbDetailPage    from './pages/public/HerbDetailPage'
import SearchResultsPage from './pages/public/SearchResultsPage'
import LoginPage         from './pages/public/LoginPage'
import RegisterPage      from './pages/public/RegisterPage'
import AboutPage         from './pages/public/AboutPage'

// User pages
import UserDashboardPage  from './pages/user/UserDashboardPage'
import HealthProfilePage  from './pages/user/HealthProfilePage'
import MyAlertsPage       from './pages/user/MyAlertsPage'
import FavoritesPage      from './pages/user/FavoritesPage'
import SearchHistoryPage  from './pages/user/SearchHistoryPage'

// Admin pages
import AdminDashboardPage    from './pages/admin/AdminDashboardPage'
import AdminDrugsPage        from './pages/admin/AdminDrugsPage'
import AdminDrugFormPage     from './pages/admin/AdminDrugFormPage'
import AdminHerbsPage        from './pages/admin/AdminHerbsPage'
import AdminHerbFormPage     from './pages/admin/AdminHerbFormPage'
import AdminInteractionsPage from './pages/admin/AdminInteractionsPage'
import AdminUsersPage        from './pages/admin/AdminUsersPage'
import AdminReportsPage      from './pages/admin/AdminReportsPage'
import AdminAlertRulesPage   from './pages/admin/AdminAlertRulesPage'

// Placeholder
const ComingSoon = ({ title }) => (
  <div className="max-w-xl mx-auto px-6 py-24 text-center">
    <div className="text-6xl mb-6">🚧</div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-400 text-sm">This page is under construction — coming soon!</p>
  </div>
)

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/>
    </div>
  )
  return user ? children : <Navigate to="/login" replace/>
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"/>
    </div>
  )
  const isAdmin = ['admin','super_admin','content_admin'].includes(user?.role)
  return isAdmin ? children : <Navigate to="/" replace/>
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/"          element={<HomePage/>}/>
          <Route path="/drugs"     element={<DrugsPage/>}/>
          <Route path="/drugs/:id" element={<DrugDetailPage/>}/>
          <Route path="/herbs"     element={<HerbsPage/>}/>
          <Route path="/herbs/:id" element={<HerbDetailPage/>}/>
          <Route path="/search"    element={<SearchResultsPage/>}/>
          <Route path="/about"     element={<AboutPage/>}/>
          <Route path="/login"     element={<LoginPage/>}/>
          <Route path="/register"  element={<RegisterPage/>}/>

          {/* Protected — user */}
          <Route path="/dashboard"      element={<ProtectedRoute><UserDashboardPage/></ProtectedRoute>}/>
          <Route path="/profile/health" element={<ProtectedRoute><HealthProfilePage/></ProtectedRoute>}/>
          <Route path="/alerts"         element={<ProtectedRoute><MyAlertsPage/></ProtectedRoute>}/>
          <Route path="/favorites"      element={<ProtectedRoute><FavoritesPage/></ProtectedRoute>}/>
          <Route path="/history"        element={<ProtectedRoute><SearchHistoryPage/></ProtectedRoute>}/>

          {/* Admin */}
          <Route path="/admin"                    element={<AdminRoute><AdminDashboardPage/></AdminRoute>}/>
          <Route path="/admin/drugs"              element={<AdminRoute><AdminDrugsPage/></AdminRoute>}/>
          <Route path="/admin/drugs/new"          element={<AdminRoute><AdminDrugFormPage/></AdminRoute>}/>
          <Route path="/admin/drugs/:id/edit"     element={<AdminRoute><AdminDrugFormPage/></AdminRoute>}/>
          <Route path="/admin/herbs"              element={<AdminRoute><AdminHerbsPage/></AdminRoute>}/>
          <Route path="/admin/herbs/new"          element={<AdminRoute><AdminHerbFormPage/></AdminRoute>}/>
          <Route path="/admin/herbs/:id/edit"     element={<AdminRoute><AdminHerbFormPage/></AdminRoute>}/>
          <Route path="/admin/interactions"       element={<AdminRoute><AdminInteractionsPage/></AdminRoute>}/>
          <Route path="/admin/users"              element={<AdminRoute><AdminUsersPage/></AdminRoute>}/>
          <Route path="/admin/reports"            element={<AdminRoute><AdminReportsPage/></AdminRoute>}/>
          <Route path="/admin/alert-rules"        element={<AdminRoute><AdminAlertRulesPage/></AdminRoute>}/>

          {/* 404 */}
          <Route path="*" element={
            <div className="text-center py-24">
              <p className="text-6xl font-bold text-gray-200">404</p>
              <p className="text-gray-500 mt-2">Page not found.</p>
            </div>
          }/>
        </Routes>
      </main>
      <Footer/>
    </div>
  )
}
