import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SpecialistDashboard from './pages/SpecialistDashboard';
import SpecialistLogbook from './pages/SpecialistLogbook';
import DoctorDirectory from './pages/DoctorDirectory';
import PatientFollowups from './pages/PatientFollowups';
import NotFound from './pages/NotFound';
import { useAuth } from './contexts/AuthContext';

type RequireAuthProps = {
  role?: 'Specialist';
  children: ReactElement;
};

function RequireAuth({ role, children }: RequireAuthProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/specialist" replace />;
  }

  return children;
}

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/specialist" replace /> : <LoginPage />} />
      <Route path="/signup" element={<Navigate to="/login" replace />} />
      <Route
        path="/specialist"
        element={
          <RequireAuth role="Specialist">
            <SpecialistDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/specialist/logbook"
        element={
          <RequireAuth role="Specialist">
            <SpecialistLogbook />
          </RequireAuth>
        }
      />
      <Route
        path="/specialist/doctors"
        element={
          <RequireAuth role="Specialist">
            <DoctorDirectory />
          </RequireAuth>
        }
      />
      <Route
        path="/specialist/referral/:id/followups"
        element={
          <RequireAuth role="Specialist">
            <PatientFollowups />
          </RequireAuth>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
