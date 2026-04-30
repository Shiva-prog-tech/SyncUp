import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../lib/api';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  headline: string;
  location: string;
  about: string;
  avatarUrl: string;
  coverUrl: string;
  skills: string[];
  connections: any[];
  profileViews: number;
  isOnline: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: object) => Promise<void>;
  logout: () => void;
  updateUser: (data: object) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('syncup_token'));
  const [loading, setLoading] = useState(true);

  const initSocket = useCallback((tok: string) => {
    const s = connectSocket(tok);
    s.on('user_online', ({ userId, isOnline }: any) => {
      setUser(prev => {
        if (!prev) return prev;
        if (prev._id === userId) return { ...prev, isOnline };
        return prev;
      });
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data);
    } catch {
      // token expired
      setToken(null);
      setUser(null);
      localStorage.removeItem('syncup_token');
      disconnectSocket();
    }
  }, []);

  useEffect(() => {
    if (token) {
      setLoading(true);
      api.getMe()
        .then(data => { setUser(data); initSocket(token); })
        .catch(() => { setToken(null); localStorage.removeItem('syncup_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, initSocket]);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    localStorage.setItem('syncup_token', data.token);
    setToken(data.token);
    setUser(data.user);
    initSocket(data.token);
  };

  const register = async (formData: object) => {
    const data = await api.register(formData);
    localStorage.setItem('syncup_token', data.token);
    setToken(data.token);
    setUser(data.user);
    initSocket(data.token);
  };

  const logout = () => {
    localStorage.removeItem('syncup_token');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  const updateUser = async (data: object) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
