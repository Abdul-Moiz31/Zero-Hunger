import { User, UserRole } from '@/types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // adjust if needed

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signUp(data: { email: string; password: string; fullName: string; role: UserRole }): Promise<User> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.fullName,
        role: data.role
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign up failed');
    }

    const user = await response.json();
    this.setCurrentUser(user);
    return user;
  }

  async signIn(data: { email: string; password: string }): Promise<User> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const user = await response.json();
    this.setCurrentUser(user);
    return user;
  }

  async signOut(): Promise<void> {
    this.setCurrentUser(null);
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  private setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    this.notifyListeners(user);
  }

  private notifyListeners(user: User | null) {
    this.listeners.forEach((listener) => listener(user));
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    this.listeners.add(callback);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.setCurrentUser(null);
      }
    }

    return {
      unsubscribe: () => {
        this.listeners.delete(callback);
      }
    };
  }
}

export const authService = AuthService.getInstance();
