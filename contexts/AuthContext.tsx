'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User, getCurrentSession, setSession,
  loginUser, registerPatient,
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentSession());
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = loginUser(email, password);
    if (result.success && result.user) setUser(result.user);
    return result;
  };

  const logout = () => {
    setSession(null);
    setUser(null);
  };

  const signup = async (name: string, email: string, phone: string, password: string) => {
    const result = registerPatient(name, email, phone, password);
    if (result.success && result.user) setUser(result.user);
    return result;
  };

  const refreshUser = () => setUser(getCurrentSession());

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
