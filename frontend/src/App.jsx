import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { useAuth } from './context/authContextValue.js'
import Landing from './pages/Landing.jsx'
import Login from './pages/auth/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import StudentDashboard from './pages/student/StudentDashboard.jsx'
import AddActivity from './pages/student/AddActivity.jsx'
import MyActivities from './pages/student/MyActivities.jsx'
import AllActivities from './pages/student/AllActivities.jsx'
import ActivityDetails from './pages/student/ActivityDetails.jsx'
import StudentProfile from './pages/student/StudentProfile.jsx'
import StaffDashboard from './pages/staff/StaffDashboard.jsx'
import StudentSubmissions from './pages/staff/StudentSubmissions.jsx'
import VerifyActivity from './pages/staff/VerifyActivity.jsx'
import StaffProfile from './pages/staff/StaffProfile.jsx'
import StaffActivityList from './pages/staff/StaffActivityList.jsx'
import StudentDirectory, { StudentRecord } from './pages/staff/StudentDirectory.jsx'
import StaffDocuments from './pages/staff/StaffDocuments.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import ManageStudents from './pages/admin/ManageStudents.jsx'
import ManageStaff from './pages/admin/ManageStaff.jsx'
import ManageCategories from './pages/admin/ManageCategories.jsx'
import Reports from './pages/admin/Reports.jsx'
import AdminActivityList from './pages/admin/AdminActivityList.jsx'
import AdminDocuments from './pages/admin/AdminDocuments.jsx'
import AdminProfile from './pages/admin/AdminProfile.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'

function RoleRoute({ role, children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  const currentRole = String(currentUser.role ?? '').toLowerCase()
  if (currentRole !== role) {
    const destination = ['student', 'staff', 'admin'].includes(currentRole) ? `/${currentRole}/dashboard` : '/login'
    return <Navigate to={destination} replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Student Module Routes */}
      <Route path="/student/dashboard" element={<RoleRoute role="student"><StudentDashboard /></RoleRoute>} />
      <Route path="/student/activity/add" element={<RoleRoute role="student"><AddActivity /></RoleRoute>} />
      <Route path="/student/add-activity" element={<RoleRoute role="student"><AddActivity /></RoleRoute>} />
      <Route path="/student/activities" element={<RoleRoute role="student"><MyActivities /></RoleRoute>} />
      <Route path="/student/all-activities" element={<RoleRoute role="student"><AllActivities /></RoleRoute>} />
      <Route path="/student/activity/:id" element={<RoleRoute role="student"><ActivityDetails /></RoleRoute>} />
      <Route path="/student/profile" element={<RoleRoute role="student"><StudentProfile /></RoleRoute>} />

      {/* Staff Module Routes */}
      <Route path="/staff/dashboard" element={<RoleRoute role="staff"><StaffDashboard /></RoleRoute>} />
      <Route path="/staff/submissions" element={<RoleRoute role="staff"><StudentSubmissions /></RoleRoute>} />
      <Route path="/staff/pending" element={<RoleRoute role="staff"><StaffActivityList status="Pending" /></RoleRoute>} />
      <Route path="/staff/verified" element={<RoleRoute role="staff"><StaffActivityList status="Verified" /></RoleRoute>} />
      <Route path="/staff/rejected" element={<RoleRoute role="staff"><StaffActivityList status="Rejected" /></RoleRoute>} />
      <Route path="/staff/students" element={<RoleRoute role="staff"><StudentDirectory /></RoleRoute>} />
      <Route path="/staff/students/:id" element={<RoleRoute role="staff"><StudentRecord /></RoleRoute>} />
      <Route path="/staff/documents" element={<RoleRoute role="staff"><StaffDocuments /></RoleRoute>} />
      <Route path="/staff/verify/:id" element={<RoleRoute role="staff"><VerifyActivity /></RoleRoute>} />
      <Route path="/staff/submission/:id" element={<RoleRoute role="staff"><VerifyActivity /></RoleRoute>} />
      <Route path="/staff/reports" element={<RoleRoute role="staff"><Reports role="staff" /></RoleRoute>} />
      <Route path="/staff/profile" element={<RoleRoute role="staff"><StaffProfile /></RoleRoute>} />

      {/* Admin Module Routes */}
      <Route path="/admin/dashboard" element={<RoleRoute role="admin"><AdminDashboard /></RoleRoute>} />
      <Route path="/admin/students" element={<RoleRoute role="admin"><ManageStudents /></RoleRoute>} />
      <Route path="/admin/staff" element={<RoleRoute role="admin"><ManageStaff /></RoleRoute>} />
      <Route path="/admin/departments" element={<RoleRoute role="admin"><Navigate to="/admin/dashboard" replace /></RoleRoute>} />
      <Route path="/admin/categories" element={<RoleRoute role="admin"><ManageCategories /></RoleRoute>} />
      <Route path="/admin/activities" element={<RoleRoute role="admin"><AdminActivityList /></RoleRoute>} />
      <Route path="/admin/activities/:id" element={<RoleRoute role="admin"><VerifyActivity /></RoleRoute>} />
      <Route path="/admin/verification" element={<RoleRoute role="admin"><AdminActivityList mode="verification" /></RoleRoute>} />
      <Route path="/admin/verification/:id" element={<RoleRoute role="admin"><VerifyActivity /></RoleRoute>} />
      <Route path="/admin/documents" element={<RoleRoute role="admin"><AdminDocuments /></RoleRoute>} />
      <Route path="/admin/reports" element={<RoleRoute role="admin"><Reports role="admin" /></RoleRoute>} />
      <Route path="/admin/profile" element={<RoleRoute role="admin"><AdminProfile /></RoleRoute>} />
      <Route path="/admin/settings" element={<RoleRoute role="admin"><AdminSettings /></RoleRoute>} />

      {/* Catch-all Wildcards */}
      <Route path="/student/*" element={<RoleRoute role="student"><NotFound /></RoleRoute>} />
      <Route path="/staff/*" element={<RoleRoute role="staff"><NotFound /></RoleRoute>} />
      <Route path="/admin/*" element={<RoleRoute role="admin"><NotFound /></RoleRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
