import type { User } from '../../types';

export interface AdminServiceUserRepository {
  getAllUsers: () => Promise<User[]>;
  getUserByUsername: (username: string) => Promise<User | undefined>;
  createUser: (username: string, email: string, password: string, role: 'USER') => Promise<User>;
}

export interface AdminServiceDeckRepository {
  clearCache?: () => void;
}

export interface AdminServiceCardRepository {
  clearCaches?: () => void;
}

export interface AdminServiceDatabaseInit {
  validateDatabase: () => Promise<boolean>;
  checkDatabaseStatus: () => Promise<boolean>;
}

export interface AdminServiceDeps {
  userRepository: AdminServiceUserRepository;
  deckRepository: AdminServiceDeckRepository;
  cardRepository: AdminServiceCardRepository;
  databaseInit: AdminServiceDatabaseInit;
}

export class AdminService {
  constructor(private readonly deps: AdminServiceDeps) {}

  listUsers(): Promise<User[]> {
    return this.deps.userRepository.getAllUsers();
  }

  async createUser(
    username: string,
    password: string
  ): Promise<{ ok: true; user: User } | { ok: false; kind: 'bad_request' | 'conflict'; message: string }> {
    const existingUser = await this.deps.userRepository.getUserByUsername(username);
    if (existingUser) {
      return { ok: false, kind: 'conflict', message: 'Username already exists' };
    }
    const newUser = await this.deps.userRepository.createUser(username, `${username}@example.com`, password, 'USER');
    return { ok: true, user: newUser };
  }

  clearDeckCache(): void {
    this.deps.deckRepository.clearCache?.();
  }

  clearCardCaches(): void {
    this.deps.cardRepository.clearCaches?.();
  }

  async getDatabaseStatus(): Promise<{
    status: 'OK';
    database: { valid: boolean; upToDate: boolean; migrations: string };
  }> {
    const isValid = await this.deps.databaseInit.validateDatabase();
    const isUpToDate = await this.deps.databaseInit.checkDatabaseStatus();
    return {
      status: 'OK',
      database: {
        valid: isValid,
        upToDate: isUpToDate,
        migrations: 'Flyway managed'
      }
    };
  }
}
