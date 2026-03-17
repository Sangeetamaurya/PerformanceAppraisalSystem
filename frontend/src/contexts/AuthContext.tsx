'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { AuthState, AuthUser, LoginPayload, RegisterPayload, UserRole } from '@/types';
import { extractApiError } from '@/lib/utils';

const TOKEN_KEY = 'pas_token';
const USER_KEY  = 'pas_user';

interface AuthContextValue extends AuthState {
  login:      (payload: LoginPayload)    => Promise<void>;
  register:   (payload: RegisterPayload) => Promise<void>;
  logout:     () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  error:      string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ROLE_HOME: Record<UserRole, string> = {
  HR: '/hr', Manager: '/manager', Employee: '/employee',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null, token: null, isLoading: true, isAuthenticated: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Restore session from sessionStorage on first load
  useEffect(() => {
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const raw   = sessionStorage.getItem(USER_KEY);
      if (token && raw && raw !== 'undefined') {
        const user: AuthUser = JSON.parse(raw);
        if (user?.role) {
          setState({ user, token, isLoading: false, isAuthenticated: true });
          return;
        }
      }
    } catch {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }
    setState(s => ({ ...s, isLoading: false }));
  }, []);

  // Backend returns { token, user: { id, name, email, role, employeeId, isFirstLogin } }
  const handleAuthResponse = useCallback((data: { token: string; user: AuthUser }) => {
    if (!data.token) throw new Error('No token in server response');
    if (!data.user?.role) throw new Error('No user/role in server response');
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });

    // If it's the employee's first login, force password change before entering dashboard
    if (data.user.isFirstLogin) {
      router.push('/change-password');
    } else {
      router.push(ROLE_HOME[data.user.role]);
    }
  }, [router]);

  const login = useCallback(async (payload: LoginPayload) => {
    setError(null);
    try {
      const data = await authService.login(payload);
      handleAuthResponse(data);
    } catch (err) {
      setError(extractApiError(err));
      throw err;
    }
  }, [handleAuthResponse]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setError(null);
    try {
      const data = await authService.register(payload);
      handleAuthResponse(data);
    } catch (err) {
      setError(extractApiError(err));
      throw err;
    }
  }, [handleAuthResponse]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    router.push('/login');
  }, [router]);

  // Allows pages (e.g. change-password) to patch user fields in state + storage
  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setState(prev => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...updates };
      sessionStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return { ...prev, user: updatedUser };
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({ ...state, login, register, logout, updateUser, error, clearError }),
    [state, login, register, logout, updateUser, error, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
