import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextType, User, Session, SignUpData } from './types';

const AUTH_BASE = 'https://iqra-sohail-2025-physical-ai-humanoid-robotics-textbook.hf.space';
const STORAGE_KEY = 'phy_ai_auth';

function loadPersistedAuth(): { user: User | null; session: Session | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.user && parsed?.session) return parsed;
    }
  } catch { /* ignore */ }
  return { user: null, session: null };
}

function persistAuth(user: User | null, session: Session | null) {
  try {
    if (user && session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, session }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* ignore */ }
}

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
  const persisted = loadPersistedAuth();
  const [user, setUser] = useState<User | null>(persisted.user);
  const [session, setSession] = useState<Session | null>(persisted.session);
  const [loading, setLoading] = useState(!persisted.user);

  const updateAuth = useCallback((u: User | null, s: Session | null) => {
    setUser(u);
    setSession(s);
    persistAuth(u, s);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch(`${AUTH_BASE}/api/auth/get-session`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          updateAuth(data.user, data.session);
        } else {
          updateAuth(null, null);
        }
      } else {
        // Keep persisted state if server is unreachable
        if (!user) updateAuth(null, null);
      }
    } catch {
      // Keep persisted state if server is unreachable
      if (!user) updateAuth(null, null);
    } finally {
      setLoading(false);
    }
  }, [updateAuth]);

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
      console.error('[AuthProvider] signUp failed:', res.status, res.statusText, err);
      throw new Error(err.message || 'Signup failed');
    }
    const body = await res.json().catch(() => null);
    if (body?.user) {
      const sessionData = body.session ?? { token: body.token };
      updateAuth(body.user, sessionData);
    } else {
      await refreshSession();
    }
  };

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${AUTH_BASE}/api/auth/sign-in/email`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      console.error('[AuthProvider] signIn failed:', res.status, res.statusText);
      throw new Error('Invalid email or password');
    }
    const body = await res.json().catch(() => null);
    if (body?.user) {
      const sessionData = body.session ?? { token: body.token };
      updateAuth(body.user, sessionData);
    } else {
      await refreshSession();
    }
  };

  const signOut = async () => {
    try {
      await fetch(`${AUTH_BASE}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch { /* ignore if server unreachable */ }
    updateAuth(null, null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}
