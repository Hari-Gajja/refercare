import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ReferralProvider } from './contexts/ReferralContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ui/Toast';
import AppRoutes from './AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ReferralProvider>
            <AppRoutes />
            <ToastContainer />
          </ReferralProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
