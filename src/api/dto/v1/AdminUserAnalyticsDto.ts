export interface AdminUserAnalyticsDto {
  generatedAt: string;
  acquisitionPeriodStart: string;
  standardUserAccounts: number;
  newStandardAccounts: number;
  loggedInLast30Days: {
    count: number;
    percentage: number;
  };
  googleAuthUsers: {
    count: number;
    percentage: number;
  };
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
}
