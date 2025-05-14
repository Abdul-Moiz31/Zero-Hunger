import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Using a named function declaration for consistent exports with Fast Refresh
function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Export the hook with the name 'useAuth'
export const useAuth = useAuthContext;

// AuthProvider component as a named function declaration
function AuthProviderComponent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true); // Start with loading true
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored credentials on component mount
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          // Set the user from localStorage
          setUser(JSON.parse(storedUser));
          
          // Optional: You could validate the token here with a backend call
          // await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/validate-token`, {
          //   headers: { Authorization: `Bearer ${storedToken}` }
          // });
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        // Clear invalid credentials
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { user, token } = response.data;

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      // Redirect based on role
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
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Export the component with the name 'AuthProvider'
export const AuthProvider = AuthProviderComponent;