"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest, type LoginResponse } from "./api";

interface AuthState {
  user: LoginResponse | null;
  token: string | null;
  ready: boolean;
  error?: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "panel-admin-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    ready: false,
    error: null,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AuthState;
        setState({ ...parsed, ready: true });
      } catch (_) {
        localStorage.removeItem(STORAGE_KEY);
        setState((prev) => ({ ...prev, ready: true }));
      }
    } else {
      setState((prev) => ({ ...prev, ready: true }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, error: null }));
    const data = await loginRequest(email, password);
    if (!data.roles?.includes("admin")) {
      throw new Error("Este panel es solo para administradores");
    }
    const nextState: AuthState = {
      user: data,
      token: data.token,
      ready: true,
      error: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    setState(nextState);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, token: null, ready: true, error: null });
  };

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state.user, state.token, state.ready, state.error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      token: null,
      ready: false,
      error: null,
      login: async () => {},
      logout: () => {},
    };
  }
  return ctx;
}
