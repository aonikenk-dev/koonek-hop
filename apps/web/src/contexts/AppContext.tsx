import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import es from '@/i18n/es';
import en from '@/i18n/en';

export type Language = 'es' | 'en';

const TRANSLATIONS = { es, en };

interface AppContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

function resolvePath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return Object.entries(params).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v)),
    str
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const raw = resolvePath(TRANSLATIONS[language], key);
      return typeof raw === 'string' ? interpolate(raw, params) : key;
    },
    [language]
  );

  return <AppContext.Provider value={{ language, setLanguage, t }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
