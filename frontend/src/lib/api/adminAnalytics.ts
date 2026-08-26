import { api } from './client';

export interface UserAnalyticsData {
  generatedAt: string;
  acquisitionPeriodStart: string;
  standardUserAccounts: number;
  newStandardAccounts: number;
  loggedInLast30Days: { count: number; percentage: number };
  googleAuthUsers: { count: number; percentage: number };
  recordedLoginUsers: number;
  signupMonths: Array<{
    month: string;
    count: number;
    recent: boolean;
    partial: boolean;
  }>;
  loginRecency: Array<{
    key: 'days0To7' | 'days8To30' | 'days31To60' | 'days61To90' | 'days90Plus';
    label: string;
    count: number;
  }>;
  deckStatistics: {
    totalDecks: number;
    legalDecks: number;
    legalPercentage: number;
    limitedDecks: number;
    limitedPercentage: number;
    averageDecksPerUser: number;
    averageLegalDecksPerUser: number;
  };
  collectionStatistics: {
    usersWithNonZeroCollections: number;
    adoptionPercentage: number;
    averageCardsPerUser: number;
    averageCardsPerCollector: number;
  };
}

export function fetchUserAnalytics(signal?: AbortSignal): Promise<UserAnalyticsData> {
  return api.get<UserAnalyticsData>('/api/v1/admin/user-analytics', signal);
}
