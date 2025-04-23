export type UserRole = 'admin' | 'donor' | 'ngo' | 'volunteer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}