import { AdminService, type AdminServiceDeps } from '../../../../src/api/services/adminService';
import type { UserAnalyticsCounts, UserAnalyticsQuery } from '../../../../src/repository/UserRepository';

function buildDeps(counts: UserAnalyticsCounts): AdminServiceDeps {
  return {
    now: () => new Date('2026-08-24T12:00:00.000Z'),
    userRepository: {
      getAllUsers: jest.fn().mockResolvedValue([]),
      getUserByUsername: jest.fn().mockResolvedValue(undefined),
      createUser: jest.fn(),
      getUserAnalytics: jest.fn().mockResolvedValue(counts)
    },
    deckRepository: {},
    cardRepository: {},
    databaseInit: {
      validateDatabase: jest.fn().mockResolvedValue(true),
      checkDatabaseStatus: jest.fn().mockResolvedValue(true)
    }
  };
}

describe('AdminService user analytics', () => {
  it('builds rolling aggregate analytics and excludes utility accounts', async () => {
    const counts: UserAnalyticsCounts = {
      standardUserAccounts: 90,
      newStandardAccounts: 40,
      loggedInLast30Days: 49,
      googleAuthUsers: 44,
      recordedLoginUsers: 77,
      signupMonths: [
        { month: '2026-06', count: 2 },
        { month: '2026-07', count: 27 },
        { month: '2026-08', count: 13 }
      ],
      loginRecency: {
        days0To7: 15,
        days8To30: 34,
        days31To60: 7,
        days61To90: 5,
        days90Plus: 16
      }
    };
    const deps = buildDeps(counts);
    const service = new AdminService(deps);

    const result = await service.getUserAnalytics();

    expect(result).toMatchObject({
      generatedAt: '2026-08-24T12:00:00.000Z',
      acquisitionPeriodStart: '2026-07-01T00:00:00.000Z',
      standardUserAccounts: 90,
      newStandardAccounts: 40,
      loggedInLast30Days: { count: 49, percentage: 54 },
      googleAuthUsers: { count: 44, percentage: 49 }
    });
    expect(result.signupMonths).toEqual([
      { month: '2026-06', count: 2, recent: false, partial: false },
      { month: '2026-07', count: 27, recent: true, partial: false },
      { month: '2026-08', count: 13, recent: true, partial: true }
    ]);

    const repositoryCall = (deps.userRepository.getUserAnalytics as jest.Mock)
      .mock.calls[0][0] as UserAnalyticsQuery;
    expect(repositoryCall.acquisitionStart.toISOString()).toBe('2026-07-01T00:00:00.000Z');
    expect(repositoryCall.signupChartStart.toISOString()).toBe('2025-09-01T00:00:00.000Z');
    expect(repositoryCall.signupChartEnd.toISOString()).toBe('2026-09-01T00:00:00.000Z');
    expect(repositoryCall.excludedUsernames).toEqual(['community_decks', 'tournament_decks']);
  });

  it('returns zero percentages when there are no standard users', async () => {
    const deps = buildDeps({
      standardUserAccounts: 0,
      newStandardAccounts: 0,
      loggedInLast30Days: 0,
      googleAuthUsers: 0,
      recordedLoginUsers: 0,
      signupMonths: [],
      loginRecency: {
        days0To7: 0,
        days8To30: 0,
        days31To60: 0,
        days61To90: 0,
        days90Plus: 0
      }
    });
    const result = await new AdminService(deps).getUserAnalytics();
    expect(result.loggedInLast30Days.percentage).toBe(0);
    expect(result.googleAuthUsers.percentage).toBe(0);
  });
});
