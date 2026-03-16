import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as api from '../services/api';

export type Role = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  companyId: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, companyId: string) => Promise<void>;
  logout: () => void;
  role: Role;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@cyberapp_token';
const USER_KEY = '@cyberapp_user';

function getStored(): { token: string; user: AuthUser } | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    if (token && userJson) {
      const user = JSON.parse(userJson) as AuthUser;
      return { token, user };
    }
  } catch {
    // ignore
  }
  return null;
}

function setStored(token: string | null, user: AuthUser | null) {
  try {
    if (token && user) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // ignore
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persist = useCallback((newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    setStored(newToken, newUser);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setStored(null, null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await api.login(email, password);
    persist(t, { ...u, role: u.role as Role });
  }, [persist]);

  const register = useCallback(
    async (email: string, password: string, companyId: string) => {
      const { token: t, user: u } = await api.register(email, password, companyId);
      persist(t, { ...u, role: u.role as Role });
    },
    [persist]
  );

  useEffect(() => {
    const stored = getStored();
    if (!stored) {
      setIsLoading(false);
      return;
    }
    api
      .getMe(stored.token)
      .then((freshUser) => {
        setUser({ ...freshUser, role: freshUser.role as Role });
        setToken(stored.token);
        setStored(stored.token, { ...freshUser, role: freshUser.role as Role });
      })
      .catch(() => {
        setStored(null, null);
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const role: Role = user?.role ?? 'user';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        role,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
