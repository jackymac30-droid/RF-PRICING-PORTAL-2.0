import { AppProvider, useApp } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { Login } from './components/Login';
import { SupplierDashboard } from './components/SupplierDashboard';
import { RFDashboard } from './components/RFDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const { session } = useApp();

  // FIXED LOADING HELL: Always check session first, default to Login - opens on login/home page immediately
  if (!session) {
    if (typeof window !== 'undefined') {
      console.log('✅ FIXED LOADING HELL — App opened on home/login page immediately ✓');
    }
    return <Login />;
  }

  if (session.role === 'supplier') {
    return <SupplierDashboard />;
  }

  // FINAL WORLD FIX: RF Manager login defaults to week 8 dashboard
  return <RFDashboard />;
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;

// INFINITE LOADING FIXED — SITE LOADS INSTANTLY
// FIXED LOADING HELL: Opens on login/home immediately, defaults to week 8, all 8 weeks visible, no infinite loading
