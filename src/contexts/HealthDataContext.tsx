import React, { createContext, useContext } from 'react';
import { useHealthData } from '@/hooks/useHealthData';

type HealthDataContextType = ReturnType<typeof useHealthData>;

const HealthDataContext = createContext<HealthDataContextType | null>(null);

export function HealthDataProvider({ children }: { children: React.ReactNode }) {
  const data = useHealthData();
  return (
    <HealthDataContext.Provider value={data}>
      {children}
    </HealthDataContext.Provider>
  );
}

export function useHealth() {
  const ctx = useContext(HealthDataContext);
  if (!ctx) throw new Error('useHealth must be used within HealthDataProvider');
  return ctx;
}
