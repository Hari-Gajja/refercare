import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { User } from '../types';
import { login as loginApi, logout as logoutApi, signup as signupApi } from '../api/auth';
import { updateProfile as updateProfileApi } from '../api/users';
import type { SignupResult } from '../api/auth';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (
    name: string,
    email: string,
    password: string,
    otpCode: string
  ) => Promise<SignupResult>;
  updateProfile: (payload: Partial<Pick<User, 'name' | 'phone' | 'specialization'>>) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'mdrs_user';

const getStoredUser = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await loginApi(email, password);
      setUser(result);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string, otpCode: string) => {
      setLoading(true);
      try {
        const result = await signupApi(name, email, password, otpCode);
        if (result.user) {
          setUser(result.user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        }
        return result;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutApi();
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('mdrs_otp_token');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (payload: Partial<Pick<User, 'name' | 'phone' | 'specialization'>>) => {
      setLoading(true);
      try {
        const updated = await updateProfileApi(payload);
        setUser(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const value = useMemo(
    () => ({ user, loading, login, signup, updateProfile, logout }),
    [user, loading, login, signup, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
