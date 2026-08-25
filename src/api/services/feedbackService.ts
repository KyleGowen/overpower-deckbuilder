import type { UserRole } from '../../types';

export type FeedbackCategory = 'bug' | 'feature';

export interface FeedbackEmail {
  category: FeedbackCategory;
  message: string;
  submitterName: string;
  submitterEmail: string;
  replyTo?: string;
}

export interface FeedbackEmailSender {
  sendFeedbackEmail(feedback: FeedbackEmail): Promise<void>;
}

export interface SubmitFeedbackInput {
  category: FeedbackCategory;
  message: string;
  submitterName: string;
  submitterEmail: string;
  submitterRole: UserRole;
}

/** Business boundary for authenticated in-app feedback delivery. */
export class FeedbackService {
  constructor(private readonly emailSender: FeedbackEmailSender) {}

  async submit(input: SubmitFeedbackInput): Promise<void> {
    const feedback: FeedbackEmail = {
      category: input.category,
      message: input.message.trim(),
      submitterName: input.submitterName.trim(),
      submitterEmail: input.submitterEmail.trim()
    };

    // Guest addresses are synthetic, so only registered users get a reply-to header.
    if (
      input.submitterRole !== 'GUEST' &&
      feedback.submitterEmail.includes('@')
    ) {
      feedback.replyTo = feedback.submitterEmail;
    }

    await this.emailSender.sendFeedbackEmail(feedback);
  }
}
