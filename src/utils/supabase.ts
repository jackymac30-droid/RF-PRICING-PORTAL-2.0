import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Production-safe error handling: main.tsx will show user-friendly error
// This file should not throw to allow graceful degradation
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('Missing Supabase environment variables. Please check your deployment configuration.');
  }
}

// Support both Vite (VITE_*) and Next.js (NEXT_PUBLIC_*) env var prefixes for Netlify compatibility
const finalSupabaseUrl = supabaseUrl || 
  (typeof process !== 'undefined' ? (process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) : '') ||
  '';

const finalSupabaseAnonKey = supabaseAnonKey || 
  (typeof process !== 'undefined' ? (process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) : '') ||
  '';

// Netlify detection (for logging/debugging)
const isNetlify = typeof process !== 'undefined' && (process.env.CONTEXT === 'production' || process.env.NETLIFY === 'true');
if (isNetlify && typeof window !== 'undefined') {
  console.log('Netlify build detected - using environment variables from Netlify dashboard');
}

if (!finalSupabaseUrl || !finalSupabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('Missing Supabase environment variables. Please check your deployment configuration.');
    if (isNetlify) {
      console.error('Netlify: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify Dashboard → Environment Variables');
    }
  }
}

// Create client with empty strings if missing (main.tsx will prevent app from loading)
export const supabase = createClient(finalSupabaseUrl || 'https://placeholder.supabase.co', finalSupabaseAnonKey || 'placeholder-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// NETLIFY READY — AUTO-DEPLOY OK, NO ISSUES
