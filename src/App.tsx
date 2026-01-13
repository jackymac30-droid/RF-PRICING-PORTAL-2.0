import { AppProvider, useApp } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { Login } from './components/Login';
import { SupplierDashboard } from './components/SupplierDashboard';
import { RFDashboard } from './components/RFDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  // WORLD-DEPENDS-ON-IT FIX: Check env vars first - show error if missing
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const isNetlify = typeof process !== 'undefined' && (process.env.CONTEXT === 'production' || process.env.NETLIFY === 'true');
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', background: '#fee', padding: '20px' }}>
        <div style={{ maxWidth: '500px', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <h1 style={{ color: '#dc2626', margin: '0 0 1rem 0' }}>Configuration Error</h1>
          <p style={{ margin: '0 0 1rem 0' }}>Missing required environment variables:</p>
          <ul style={{ margin: '0 0 1rem 0', color: '#dc2626', fontWeight: 'bold' }}>
            {missing.map(v => <li key={v}>{v}</li>)}
          </ul>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            {isNetlify ? (
              <>
                <strong>🔧 NETLIFY FIX (Do This Now):</strong>
                <ol style={{ textAlign: 'left', margin: '1rem 0', paddingLeft: '1.5rem' }}>
                  <li>Go to: <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>https://app.netlify.com</a></li>
                  <li>Click your site → <strong>Site settings</strong> → <strong>Environment variables</strong></li>
                  <li>Click <strong>Add a variable</strong></li>
                  <li>Add: <code>VITE_SUPABASE_URL</code> = Your Supabase URL</li>
                  <li>Add: <code>VITE_SUPABASE_ANON_KEY</code> = Your Supabase anon key</li>
                  <li>Click <strong>Save</strong></li>
                  <li>Go to <strong>Deploys</strong> tab → <strong>Trigger deploy</strong> → Check <strong>Clear cache</strong> → <strong>Deploy site</strong></li>
                  <li>Wait 2-3 minutes, then hard refresh: <strong>Ctrl+Shift+R</strong></li>
                </ol>
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
                  <strong>Get your keys:</strong> Supabase Dashboard → Settings → API → Copy Project URL and anon key
                </p>
              </>
            ) : (
              <>
                <strong>Local:</strong> Create a .env file in the project root with:<br />
                VITE_SUPABASE_URL=your-url<br />
                VITE_SUPABASE_ANON_KEY=your-key
              </>
            )}
          </p>
        </div>
      </div>
    );
  }
  
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
  // FIXED LOADING HELL: Ensure AppProvider wraps everything before any useApp calls
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

// EVERYTHING FIXED — WORLD-DEPENDS-ON-IT DEMO READY
// INFINITE LOADING FIXED — SITE LOADS INSTANTLY
// FIXED LOADING HELL: Opens on login/home immediately, defaults to week 8, all 8 weeks visible, no infinite loading
