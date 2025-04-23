import { User, UserRole } from '@/types/auth';

// Mock user data storage
const users = new Map<string, User>();

// Mock admin user
users.set('admin@zerohunger.com', {
  id: '1',
  email: 'admin@zerohunger.com',
  fullName: 'System Administrator',
  role: 'admin'
});

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
    // Check if email exists
    if (users.has(data.email)) {
      throw new Error('Email already exists');
    }

    // Create new user
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      fullName: data.fullName,
      role: data.role
    };

    users.set(data.email, user);
    this.setCurrentUser(user);
    return user;
  }

  async signIn(data: { email: string; password: string }): Promise<User> {
    const user = users.get(data.email);
    if (!user) {
      throw new Error('Invalid login credentials');
    }

    this.setCurrentUser(user);
    return user;
  }

  async signOut(): Promise<void> {
    this.setCurrentUser(null);
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
    this.listeners.forEach(listener => listener(user));
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    this.listeners.add(callback);
    
    // Check local storage for existing session
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