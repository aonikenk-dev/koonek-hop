import { createContext, useContext, useState, type ReactNode } from 'react';

export type Role = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT';

export interface AuthUser {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock credentials for the visual prototype (Phase 2). No backend call yet —
// see MIGRATION.md Phase 3/4 for wiring this up against apps/api.
const DEMO_USERS: Array<AuthUser & { password: string }> = [
  {
    id: 'demo-user-1',
    organizationId: 'demo-org',
    email: 'admin@koonek.app',
    password: 'koonek2026',
    firstName: 'Valentina',
    lastName: 'Ríos',
    role: 'ADMIN',
  },
  {
    id: 'demo-user-2',
    organizationId: 'demo-org',
    email: 'doctor@koonek.app',
    password: 'koonek2026',
    firstName: 'Martín',
    lastName: 'Suárez',
    role: 'DOCTOR',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem('koonek_user');
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const login = (email: string, password: string): LoginResult => {
    const match = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (!match) return { ok: false, error: 'invalid' };
    const { password: _pw, ...safeUser } = match;
    setUser(safeUser);
    sessionStorage.setItem('koonek_user', JSON.stringify(safeUser));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('koonek_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
