import { createContext, useContext, useState, type ReactNode } from 'react';
import { apiFetch, setToken, clearToken } from '@/services/api';

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
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem('koonek_user');
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const { token, user: apiUser } = await apiFetch<{ token: string; user: AuthUser }>(
        '/api/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      );
      setToken(token);
      setUser(apiUser);
      sessionStorage.setItem('koonek_user', JSON.stringify(apiUser));
      return { ok: true };
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      return { ok: false, error: status === 401 ? 'invalid' : 'network_error' };
    }
  };

  const logout = () => {
    setUser(null);
    clearToken();
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
