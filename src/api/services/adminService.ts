import type { User } from '../../types';
import type { AdminUserAnalyticsDto } from '../dto/v1/AdminUserAnalyticsDto';
import type { UserAnalyticsCounts, UserAnalyticsQuery } from '../../repository/UserRepository';

const ANALYTICS_UTILITY_USERNAMES = ['community_decks', 'tournament_decks'] as const;

export interface AdminServiceUserRepository {
  getAllUsers: () => Promise<User[]>;
  getUserByUsername: (username: string) => Promise<User | undefined>;
  createUser: (username: string, email: string, password: string, role: 'USER') => Promise<User>;
  getUserAnalytics: (query: UserAnalyticsQuery) => Promise<UserAnalyticsCounts>;
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
  now?: () => Date;
}

export class AdminService {
  constructor(private readonly deps: AdminServiceDeps) {}

  listUsers(): Promise<User[]> {
    return this.deps.userRepository.getAllUsers();
  }

  async getUserAnalytics(): Promise<AdminUserAnalyticsDto> {
    const asOf = this.deps.now?.() ?? new Date();
    const currentMonthStart = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), 1));
    const acquisitionStart = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() - 1, 1));
    const signupChartStart = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() - 11, 1));
    const signupChartEnd = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() + 1, 1));
    const counts = await this.deps.userRepository.getUserAnalytics({
      asOf,
      acquisitionStart,
      signupChartStart,
      signupChartEnd,
      excludedUsernames: ANALYTICS_UTILITY_USERNAMES
    });
    const userPercentage = (count: number) => counts.standardUserAccounts === 0
      ? 0
      : Math.round((count / counts.standardUserAccounts) * 100);
    const percentage = (count: number, total: number) => total === 0
      ? 0
      : Math.round((count / total) * 1000) / 10;
    const average = (count: number, total: number) => total === 0
      ? 0
      : Math.round((count / total) * 10) / 10;
    const currentMonth = currentMonthStart.toISOString().slice(0, 7);

    return {
      generatedAt: asOf.toISOString(),
      acquisitionPeriodStart: acquisitionStart.toISOString(),
      standardUserAccounts: counts.standardUserAccounts,
      newStandardAccounts: counts.newStandardAccounts,
      loggedInLast30Days: {
        count: counts.loggedInLast30Days,
        percentage: userPercentage(counts.loggedInLast30Days)
      },
      googleAuthUsers: {
        count: counts.googleAuthUsers,
        percentage: userPercentage(counts.googleAuthUsers)
      },
      recordedLoginUsers: counts.recordedLoginUsers,
      signupMonths: counts.signupMonths.map((month) => ({
        ...month,
        recent: month.month >= acquisitionStart.toISOString().slice(0, 7),
        partial: month.month === currentMonth
      })),
      loginRecency: [
        { key: 'days0To7', label: '0–7 days', count: counts.loginRecency.days0To7 },
        { key: 'days8To30', label: '8–30 days', count: counts.loginRecency.days8To30 },
        { key: 'days31To60', label: '31–60 days', count: counts.loginRecency.days31To60 },
        { key: 'days61To90', label: '61–90 days', count: counts.loginRecency.days61To90 },
        { key: 'days90Plus', label: '90+ days', count: counts.loginRecency.days90Plus }
      ],
      deckStatistics: {
        totalDecks: counts.deckStatistics.totalDecks,
        legalDecks: counts.deckStatistics.legalDecks,
        legalPercentage: percentage(counts.deckStatistics.legalDecks, counts.deckStatistics.totalDecks),
        limitedDecks: counts.deckStatistics.limitedDecks,
        limitedPercentage: percentage(counts.deckStatistics.limitedDecks, counts.deckStatistics.totalDecks),
        averageDecksPerUser: average(counts.deckStatistics.totalDecks, counts.standardUserAccounts),
        averageLegalDecksPerUser: average(counts.deckStatistics.legalDecks, counts.standardUserAccounts)
      },
      collectionStatistics: {
        usersWithNonZeroCollections: counts.collectionStatistics.usersWithNonZeroCollections,
        adoptionPercentage: percentage(
          counts.collectionStatistics.usersWithNonZeroCollections,
          counts.standardUserAccounts
        ),
        averageCardsPerUser: average(
          counts.collectionStatistics.totalOwnedCards,
          counts.standardUserAccounts
        ),
        averageCardsPerCollector: average(
          counts.collectionStatistics.totalOwnedCards,
          counts.collectionStatistics.usersWithNonZeroCollections
        )
      }
    };
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
