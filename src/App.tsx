import { AppProvider, useApp } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { Login } from './components/Login';
import { SupplierDashboard } from './components/SupplierDashboard';
import { RFDashboard } from './components/RFDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const { session } = useApp();

  // WORLD FIX: Always check session first, default to Login - opens on login/home page
  if (!session) {
    if (typeof window !== 'undefined') {
      console.log('✅ DEMO FIXED — App opened on home/login page ✓');
    }
    return <Login />;
  }

  if (session.role === 'supplier') {
    return <SupplierDashboard />;
  }

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

// BOARD-SPOON-FEED DEMO READY — SIMPLE AS CHILD
// FIXED FOR BOARD SPOON-FEED: Opens on login/home, defaults to week 8, all 8 weeks visible
