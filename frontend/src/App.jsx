import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/auth-context';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamReports from './pages/manager/TeamReports';
import ProjectManager from './pages/manager/ProjectManager';

// Member Pages
import MemberDashboard from './pages/member/MemberDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, roleRequired }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    // Role එක check කිරීමේදී lowercase කර පරීක්ෂා කරන්න
    if (roleRequired && user.role?.toLowerCase() !== roleRequired.toLowerCase()) {
        return <Navigate to="/login" />; 
    }

    return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Manager Routes (Protected) */}
          <Route path="/manager-dashboard" element={
            <ProtectedRoute roleRequired="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager/reports" element={
            <ProtectedRoute roleRequired="manager">
              <TeamReports />
            </ProtectedRoute>
          } />
          <Route path="/manager/projects" element={
            <ProtectedRoute roleRequired="manager">
              <ProjectManager />
            </ProtectedRoute>
          } />

          {/* Member Routes (Protected) */}
          <Route path="/member-dashboard" element={
            <ProtectedRoute roleRequired="member">
              <MemberDashboard />
            </ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
