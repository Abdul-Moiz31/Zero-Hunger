/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/axios';
import { disconnectSocket } from '@/utils/socket';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'donor' | 'ngo' | 'volunteer' | 'admin';
  organization_name?: string;
  contact_number?: string;
  status?: 'Active' | 'Inactive';
  completedOrders?: number;
  joinedDate?: Date;
  isApproved?: boolean;
  ngoId?: string;
}

interface Org {
  _id: string;
  organization_name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => void;
  orgNames: Org[];
  updateProfile: (data: Partial<User>) => Promise<void>;
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

    const fetchOrgs = async () => {
      try {
        const resp = await api.get<Org[]>(`/auth/org-names`);
        setOrgNames(resp.data);
      } catch (err) {
        console.error('Failed to load organization names', err);
      }
    };
    fetchOrgs();
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const response = await api.post(`/auth/login`, { email, password });
      const { user, token } = response.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      return response.data;
    } catch (error: any) {
      // Surface the server's message (e.g. "pending admin approval") when present.
      const message = error?.response?.data?.message || 'Invalid email or password';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    disconnectSocket();
    navigate('/auth');
  };
 const updateProfile = async (data: Partial<User>) => {
  try {
    const response = await api.put(`/auth/update-profile`, data);
    setUser(response.data.user);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};
  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, orgNames , updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}