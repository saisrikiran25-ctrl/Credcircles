'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_PERSONAS, DemoPersona, DEFAULT_USER_ID } from '@/lib/session';

interface AppContextType {
  currentUser: DemoPersona;
  setCurrentUserId: (id: string) => void;
  complianceMode: 'PARTNERED_ESCROW' | 'CLOSED_CIRCLES';
  setComplianceMode: (mode: 'PARTNERED_ESCROW' | 'CLOSED_CIRCLES') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<DemoPersona>(() => {
    return DEMO_PERSONAS.find((p) => p.id === DEFAULT_USER_ID) || DEMO_PERSONAS[0];
  });

  const [complianceMode, setComplianceModeState] = useState<'PARTNERED_ESCROW' | 'CLOSED_CIRCLES'>('PARTNERED_ESCROW');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // default sleek dark mode
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Load persisted preferences if available
    const savedUserId = localStorage.getItem('circlo_user_id');
    if (savedUserId) {
      const found = DEMO_PERSONAS.find((p) => p.id === savedUserId);
      if (found) setCurrentUser(found);
    }

    const savedMode = localStorage.getItem('circlo_compliance_mode');
    if (savedMode === 'PARTNERED_ESCROW' || savedMode === 'CLOSED_CIRCLES') {
      setComplianceModeState(savedMode);
    }

    const savedTheme = localStorage.getItem('circlo_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const setCurrentUserId = (id: string) => {
    const found = DEMO_PERSONAS.find((p) => p.id === id);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('circlo_user_id', id);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const setComplianceMode = (mode: 'PARTNERED_ESCROW' | 'CLOSED_CIRCLES') => {
    setComplianceModeState(mode);
    localStorage.setItem('circlo_compliance_mode', mode);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('circlo_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUserId,
        complianceMode,
        setComplianceMode,
        isDarkMode,
        toggleDarkMode,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
