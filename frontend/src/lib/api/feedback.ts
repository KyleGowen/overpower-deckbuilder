import { api } from './client';

export type FeedbackCategory = 'bug' | 'feature';

export const SUPPORT_EMAIL = 'kyle@excelsior.cards';
export const OVERPOWER_DISCORD_URL = 'https://discord.gg/overpowerlives';

export const SUPPORT_EMAIL_URL =
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Excelsior support or feedback')}`;

export async function submitFeedback(
  category: FeedbackCategory,
  message: string
): Promise<{ submitted: true }> {
  return api.post<{ submitted: true }>('/api/v1/feedback', { category, message });
}
