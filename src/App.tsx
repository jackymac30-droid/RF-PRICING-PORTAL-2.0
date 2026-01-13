import { AppProvider, useApp } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { Login } from './components/Login';
import { SupplierDashboard } from './components/SupplierDashboard';
import { RFDashboard } from './components/RFDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const { session } = useApp();

  // FINAL WORLD FIX: Always check session first, default to Login - opens on login/home page
  if (!session) {
    if (typeof window !== 'undefined') {
      console.log('✅ FINAL WORLD FIX — App opened on home/login page ✓');
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

// NEXT-LEVEL FIX: Opens on login/home, defaults to week 8, all 8 weeks visible
// KILLED ALL FILTERS: Removed filters, limits, slices on weeks
// NEXT-LEVEL FIX — ALL 8 WEEKS FORCED
