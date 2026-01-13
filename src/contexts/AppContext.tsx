import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import type { Session } from '../types';
import { loadSession, saveSession } from '../utils/database';

interface AppContextType {
  session: Session | null;
  login: (userId: string, userName: string, role: 'supplier' | 'rf', supplierId?: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function validateSession(session: Session | null): Session | null {
  if (!session) return null;
  if (session.role === 'supplier' && session.supplier_id) {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(session.supplier_id)) {
      return null;
    }
  }
  return session;
}

export function AppProvider({ children }: { children: ReactNode }) {
  // FIX LOCALHOST: Clear any old/invalid sessions on localhost to force login page
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  // FIXED LOADING HELL: Defensive session loading - catch errors during initialization
  const [session, setSession] = useState<Session | null>(() => {
    try {
      // FIX LOCALHOST: On localhost with empty database, clear session to show login/seed button
      if (isLocalhost) {
        const loaded = loadSession();
        // If session exists but database is empty, clear it to show login page with seed button
        // This allows user to see the seed button instead of "No Data Available"
        if (loaded) {
          // Keep session only if it's valid - otherwise clear it
          const validated = validateSession(loaded);
          if (!validated) {
            saveSession(null);
            return null;
          }
          return validated;
        }
        return null;
      }
      
      const loaded = loadSession();
      const validated = validateSession(loaded);
      if (!validated && loaded) {
        saveSession(null);
      }
      return validated;
    } catch (err) {
      console.error('FIXED LOADING HELL: Error loading session:', err);
      return null;
    }
  });

  const login = (userId: string, userName: string, role: 'supplier' | 'rf', supplierId?: string) => {
    const newSession: Session = {
      user_id: userId,
      user_name: userName,
      role,
      supplier_id: supplierId,
    };

    if (role === 'supplier') {
      localStorage.removeItem('supplier_quote_inputs');
      localStorage.removeItem('supplier_response_inputs');
      localStorage.removeItem('supplier_expanded_rows');
    }

    setSession(newSession);
    saveSession(newSession);
  };

  const logout = () => {
    setSession(null);
    saveSession(null);
  };

  // FIXED LOADING HELL: Memoize context value to prevent unnecessary re-renders (fixes flickering)
  const contextValue = useMemo(() => ({
    session,
    login,
    logout,
  }), [session]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
