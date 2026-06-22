import { User, UserRole } from '../types';

export interface UserRepository {
  // Initialization
  initialize(): Promise<void>;

  // User management
  createUser(name: string, email: string, password: string, role?: UserRole): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  /** Returns auth_provider for self-service account checks (e.g. Google email lock). */
  getUserAuthMeta(id: string): Promise<{ auth_provider: string | null } | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  authenticateUser(username: string, password: string): Promise<User | undefined>;
  createGoogleUser(email: string, name: string, firebaseUid: string): Promise<User>;
  linkGoogleToUser(userId: string, firebaseUid: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateLastLoginAt(id: string): Promise<void>;
  // Security
  updateUserPassword(id: string, newPlainPassword: string): Promise<boolean>;
  deleteUser(id: string): Promise<boolean>;

  // Statistics
  getUserStats(): Promise<{
    users: number;
  }>;
}
