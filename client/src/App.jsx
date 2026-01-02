import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TeamProject from './pages/TeamProject';
import Profile from './pages/Profile';
import JoinTeam from './pages/JoinTeam';
import Teams from './pages/Teams';
import TeamChat from './pages/TeamChat';
import Matches from './pages/Matches';
import ProfileOnboarding from './pages/ProfileOnboarding';
import Chat from './pages/Chat';
import { AuthProvider, useAuth } from './context/AuthContext';
import Background from './components/Background';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

const RequireProfile = ({ children }) => {
  const { user, loading } = useAuth();

  // 1️⃣ Still resolving auth
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // 2️⃣ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ Logged in but profile incomplete
  if (!user.isProfileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // 4️⃣ All checks passed
  return children;
};



function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Auth */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/signup"
        element={!user ? <Signup /> : <Navigate to="/onboarding" />}
      />

      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <ProfileOnboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teams/:teamId/project"
        element={
          <ProtectedRoute>
            <RequireProfile>
              <TeamProject />
            </RequireProfile>
          </ProtectedRoute>
        }
      />


      {/* Core App (Onboarding required) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RequireProfile>
              <Dashboard />
            </RequireProfile>
          </ProtectedRoute>
        }
      />
      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <RequireProfile>
              <Matches />
            </RequireProfile>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <RequireProfile>
              <Chat />
            </RequireProfile>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <RequireProfile>
              <Teams />
            </RequireProfile>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teams/:teamId/chat"
        element={
          <ProtectedRoute>
            <RequireProfile>
              <TeamChat />
            </RequireProfile>
          </ProtectedRoute>
        }
      />

      <Route
        path="/join/:token"
        element={
          <ProtectedRoute>
            <RequireProfile>
              <JoinTeam />
            </RequireProfile>
          </ProtectedRoute>
        }
      />

      {/* Profile (allowed anytime) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to={user ? '/dashboard' : '/login'} />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Background />
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
