"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signin, signup, forgotPassword, verifyResetCode, resetPassword as apiResetPassword, logout as apiLogout, User } from '@/services/clientApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; passwordConfirm: string; phone?: string }) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetCode: (resetCode: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string, newPasswordConfirm: string) => Promise<void>;
  checkTokenValidity: () => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  const getIsAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    return !!(localStorage.getItem('token') && localStorage.getItem('user') && user);
  };

  const checkTokenValidity = () => {
    if (typeof window === 'undefined') return false;
    return !!(localStorage.getItem('token') && localStorage.getItem('user'));
  };

  const login = async (email: string, password: string) => {
    const response = await signin({ email, password });

    // Handle all common backend response shapes:
    //  { token, data: { user } }  — most Express backends
    //  { data: { token, user } }
    //  { token, user }             — flat shape
    const userData =
      response?.data?.user ??
      response?.user ??
      null;

    const token =
      response?.token ??
      response?.data?.token ??
      null;

    if (!token) {
      throw new Error('Login failed: server did not return an authentication token.');
    }
    if (!userData) {
      throw new Error('Login failed: server did not return user data.');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (userData: { name: string; email: string; password: string; passwordConfirm: string; phone?: string }) => {
    const response = await signup({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      passwordConfirm: userData.passwordConfirm,
      phone: userData.phone || '',
    });

    const newUser = response?.data?.user ?? response?.user ?? null;
    const token = response?.data?.token ?? response?.token ?? null;

    if (!newUser || !token) {
      throw new Error('Invalid response from server – missing user or token');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    const token = localStorage.getItem('token');
    // Best-effort server-side token invalidation; don't block the UI on it.
    if (token) apiLogout(token).catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleForgotPassword = async (email: string) => {
    await forgotPassword(email);
  };

  const handleVerifyResetCode = async (resetCode: string) => {
    await verifyResetCode(resetCode);
  };

  const handleResetPassword = async (email: string, newPassword: string, newPasswordConfirm: string) => {
    await apiResetPassword(email, newPassword, newPasswordConfirm);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: getIsAuthenticated(),
      login,
      register,
      logout,
      forgotPassword: handleForgotPassword,
      verifyResetCode: handleVerifyResetCode,
      resetPassword: handleResetPassword,
      checkTokenValidity,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
