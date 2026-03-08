import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextType, User, Session, SignUpData } from './types';

const AUTH_BASE = 'http://localhost:3001';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  refreshSession: async () => {},
});

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch(`${AUTH_BASE}/api/auth/get-session`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          setSession(data.session);
        } else {
          setUser(null);
          setSession(null);
        }
      } else {
        setUser(null);
        setSession(null);
      }
    } catch {
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signUp = async (data: SignUpData) => {
    const res = await fetch(`${AUTH_BASE}/api/auth/sign-up/email`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        softwareBackground: JSON.stringify(data.softwareBackground),
        gpuTier: data.gpuTier,
        ramTier: data.ramTier,
        hasJetson: data.hasJetson,
        robotPlatform: data.robotPlatform,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Signup failed');
    }
    await refreshSession();
  };

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${AUTH_BASE}/api/auth/sign-in/email`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error('Invalid email or password');
    }
    await refreshSession();
  };

  const signOut = async () => {
    await fetch(`${AUTH_BASE}/api/auth/sign-out`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}
