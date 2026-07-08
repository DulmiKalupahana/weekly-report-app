import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Profile from './pages/Profile';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamReports from './pages/manager/TeamReports';
import ProjectManager from './pages/manager/ProjectManager';

// Member Pages
import MyReports from './pages/member/MyReports';
import MyProjects from './pages/member/MyProjects';
import MemberDashboard from './pages/member/MemberDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, roleRequired }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    if (roleRequired && user.role?.toLowerCase() !== roleRequired.toLowerCase()) {
        return <Navigate to="/login" />;
    }

    return children;
};

function App() {
  return (
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />

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
          <Route path="/member/reports" element={
            <ProtectedRoute roleRequired="member">
              <MyReports />
            </ProtectedRoute>
          } />
          <Route path="/member/projects" element={
            <ProtectedRoute roleRequired="member">
              <MyProjects />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={<Profile />} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
