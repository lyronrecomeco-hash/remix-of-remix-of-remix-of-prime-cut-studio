import { createContext, useContext, ReactNode } from 'react';
import type { TemplateConfig } from '@/components/affiliate/templates/types';

interface DemoContextType {
  isDemo: boolean;
  config: TemplateConfig | null;
}

const DemoContext = createContext<DemoContextType>({
  isDemo: false,
  config: null,
});

interface DemoProviderProps {
  children: ReactNode;
  config: TemplateConfig | null;
}

export function DemoProvider({ children, config }: DemoProviderProps) {
  return (
    <DemoContext.Provider value={{ isDemo: !!config, config }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}
