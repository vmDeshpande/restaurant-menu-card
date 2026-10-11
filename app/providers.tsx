"use client";

import { createContext, useCallback, useEffect, useContext, useState } from "react";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string | null;
};

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    // Auth state is authoritative on the server (cookie-based session).
    // This client hook exists so UI can react to login/logout transitions.
    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}