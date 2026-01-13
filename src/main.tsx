import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Support both Vite (VITE_*) and Next.js (NEXT_PUBLIC_*) env var prefixes for Netlify compatibility
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Netlify detection (for logging/debugging)
const isNetlify = typeof process !== 'undefined' && (process.env.CONTEXT === 'production' || process.env.NETLIFY === 'true');
if (isNetlify && typeof window !== 'undefined') {
  console.log('✅ Netlify build detected - using environment variables from Netlify dashboard');
  console.log('Netlify env check: URL loaded', supabaseUrl ? '✓' : '✗ (MISSING - set VITE_SUPABASE_URL in Netlify Dashboard)');
  console.log('Netlify env check: Key loaded', supabaseAnonKey ? '✓' : '✗ (MISSING - set VITE_SUPABASE_ANON_KEY in Netlify Dashboard)');
  
  // NEXT-LEVEL FIX: Better error messages for Netlify
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('🚨 NETLIFY FIX REQUIRED:');
    console.error('1. Go to: https://app.netlify.com');
    console.error('2. Click your site → Site settings → Environment variables');
    console.error('3. Add: VITE_SUPABASE_URL = your Supabase URL');
    console.error('4. Add: VITE_SUPABASE_ANON_KEY = your Supabase anon key');
    console.error('5. Click Save → Go to Deploys → Trigger deploy → Clear cache → Deploy');
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');

  // Missing required environment variables - show error and prevent app from loading
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; background: #fee;">
        <div style="max-width: 500px; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <h1 style="color: #dc2626; margin: 0 0 1rem 0;">Configuration Error</h1>
          <p style="margin: 0 0 1rem 0;">Missing required environment variables:</p>
          <ul style="margin: 0 0 1rem 0; color: #dc2626; font-weight: bold;">
            ${missing.map(v => `<li>${v}</li>`).join('')}
          </ul>
          <p style="margin: 0; color: #666; font-size: 0.9rem;">
            Contact your administrator or check deployment configuration.
            ${isNetlify ? `
            <br><br><strong>🔧 NETLIFY FIX (Do This Now):</strong>
            <ol style="text-align: left; margin: 1rem 0; padding-left: 1.5rem;">
              <li>Go to: <a href="https://app.netlify.com" target="_blank" style="color: #2563eb;">https://app.netlify.com</a></li>
              <li>Click your site → <strong>Site settings</strong> → <strong>Environment variables</strong></li>
              <li>Click <strong>Add a variable</strong></li>
              <li>Add: <code>VITE_SUPABASE_URL</code> = Your Supabase URL</li>
              <li>Add: <code>VITE_SUPABASE_ANON_KEY</code> = Your Supabase anon key</li>
              <li>Click <strong>Save</strong></li>
              <li>Go to <strong>Deploys</strong> tab → <strong>Trigger deploy</strong> → Check <strong>Clear cache</strong> → <strong>Deploy site</strong></li>
              <li>Wait 2-3 minutes, then hard refresh: <strong>Ctrl+Shift+R</strong></li>
            </ol>
            <p style="margin-top: 1rem; font-size: 0.85rem; color: #666;">
              <strong>Get your keys:</strong> Supabase Dashboard → Settings → API → Copy Project URL and anon key
            </p>
            ` : '<br><br><strong>Local:</strong> Create a .env file in the project root with:<br>VITE_SUPABASE_URL=your-url<br>VITE_SUPABASE_ANON_KEY=your-key'}
          </p>
        </div>
      </div>
    `;
  }
  // Don't throw - just stop execution so error message stays visible
  console.error('Missing required environment variables:', missing.join(', '));
  // Exit early - don't try to mount React (can't use return in top-level module)
} else {
  // Only mount React if env vars are present
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  try {
    // BOARD DEMO: Don't clear session - let login work normally
    // User can still logout manually if needed
    // Session persistence is important for workflow continuity
    
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error: any) {
    // Failed to render app - show error UI
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; background: #fee; padding: 20px;">
        <div style="max-width: 600px; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <h1 style="color: #dc2626; margin: 0 0 1rem 0; font-size: 24px;">Application Error</h1>
          <p style="margin: 0 0 1rem 0; color: #333;">The application failed to load. Please check the browser console (F12) for details.</p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
            <p style="margin: 0; color: #991b1b; font-family: monospace; font-size: 14px; word-break: break-all;">
              ${error?.message || error?.toString() || 'Unknown error'}
            </p>
          </div>
          <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}

// EVERYTHING FIXED — LAST PROMPT DONE
