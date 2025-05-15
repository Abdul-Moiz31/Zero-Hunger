/* AuthContext.tsx */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { User } from '@/types/auth';

interface Org {
  _id: string;
  organization_name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  orgNames: Org[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export const useAuth = useAuthContext;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [orgNames, setOrgNames] = useState<Org[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Restore user from localStorage
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error restoring auth state:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    loadUser();

    // Fetch organization names
    const fetchOrgs = async () => {
      try {
        const resp = await axios.get<Org[]>(`${import.meta.env.VITE_API_BASE_URL}/auth/org-names`);
        setOrgNames(resp.data);
      } catch (err) {
        console.error('Failed to load organization names', err);
      }
    };
    fetchOrgs();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, { email, password });
      const { user, token } = response.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      const routes: Record<string, string> = {
        admin: '/admin-dashboard',
        donor: '/donor-dashboard',
        ngo: '/ngo-dashboard',
        volunteer: '/volunteer-dashboard',
      };
      navigate(routes[user.role] || '/');
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, orgNames }}>
      {children}
    </AuthContext.Provider>
  );
}