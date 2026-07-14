import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithOtp: (identifier: string, otp: string) => Promise<User>;
  register: (data: Record<string, string>) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('meccio_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.me()
        .then((res) => setUser(res.data.data))
        .catch(() => {
          localStorage.removeItem('meccio_token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { user: u, token: t } = res.data.data;
    localStorage.setItem('meccio_token', t);
    setToken(t);
    setUser(u);
    return u as User;
  }, []);

  const loginWithOtp = useCallback(async (identifier: string, otp: string) => {
    const res = await authApi.loginWithOtp({ identifier, otp });
    const { user: u, token: t } = res.data.data;
    localStorage.setItem('meccio_token', t);
    setToken(t);
    setUser(u);
    return u as User;
  }, []);

  const register = useCallback(async (data: Record<string, string>) => {
    const res = await authApi.register(data);
    const { user: u, token: t } = res.data.data;
    localStorage.setItem('meccio_token', t);
    setToken(t);
    setUser(u);
    return u as User;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('meccio_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((u: User) => setUser(u), []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginWithOtp, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
