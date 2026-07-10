import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';

export type Role = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  companyId: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, companyId: string, companyRecId: string, name?: string) => Promise<void>;
  logout: () => void;
  role: Role;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@cyberapp_token';
const USER_KEY = '@cyberapp_user';

async function getStored(): Promise<{ token: string; user: AuthUser } | null> {
  try {
    let token: string | null;
    let userJson: string | null;

    if (Platform.OS === 'web') {
      token = localStorage.getItem(TOKEN_KEY);
      userJson = localStorage.getItem(USER_KEY);
    } else {
      [token, userJson] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
    }

    if (token && userJson) {
      const user = JSON.parse(userJson) as AuthUser;
      return { token, user };
    }
  } catch {
    // ignore
  }
  return null;
}

async function setStored(token: string | null, user: AuthUser | null): Promise<void> {
  try {
    if (token && user) {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        await Promise.all([
          AsyncStorage.setItem(TOKEN_KEY, token),
          AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
        ]);
      }
    } else {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } else {
        await Promise.all([
          AsyncStorage.removeItem(TOKEN_KEY),
          AsyncStorage.removeItem(USER_KEY),
        ]);
      }
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

  const persist = useCallback(async (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    await setStored(newToken, newUser);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setStored(null, null);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const { token: t, user: u } = await api.login(email, password);
    const authUser: AuthUser = { ...u, role: u.role as Role };
    await persist(t, authUser);
    return authUser;
  }, [persist]);

  const register = useCallback(
    async (email: string, password: string, companyId: string, companyRecId: string, name?: string) => {
      const { token: t, user: u } = await api.register(email, password, companyId, companyRecId, name);
      await persist(t, { ...u, role: u.role as Role });
    },
    [persist]
  );

  useEffect(() => {
    (async () => {
      const stored = await getStored();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const freshUser = await api.getMe(stored.token);
        const authUser: AuthUser = { ...freshUser, role: freshUser.role as Role };
        setUser(authUser);
        setToken(stored.token);
        await setStored(stored.token, authUser);
      } catch {
        await setStored(null, null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
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
