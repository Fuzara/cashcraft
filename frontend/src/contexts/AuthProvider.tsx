"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";

interface AuthContextProps {
  authClient: AuthClient | null;
  isAuthenticated: boolean;
  principal: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  authClient: null,
  isAuthenticated: false,
  principal: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);

      const authed = await client.isAuthenticated();
      if (authed) {
        const identity = client.getIdentity();
        setIsAuthenticated(true);
        setPrincipal(identity.getPrincipal().toText());
      }
      setLoading(false);
    };

    init();
  }, []);

  const login = async () => {
    if (!authClient) return;

    await authClient.login({
      identityProvider: process.env.NEXT_PUBLIC_II_PROVIDER ?? "https://identity.ic0.app",
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        setIsAuthenticated(true);
        setPrincipal(identity.getPrincipal().toText());
      },
    });
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
  };

  return (
    <AuthContext.Provider value={{ authClient, isAuthenticated, principal, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
