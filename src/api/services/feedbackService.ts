import type { UserRole } from '../../types';

export type FeedbackCategory = 'bug' | 'feature';

export interface FeedbackEmail {
  category: FeedbackCategory;
  message: string;
  replyTo?: string;
}

export interface FeedbackEmailSender {
  sendFeedbackEmail(feedback: FeedbackEmail): Promise<void>;
}

export interface SubmitFeedbackInput {
  category: FeedbackCategory;
  message: string;
  submitterEmail?: string;
  submitterRole: UserRole;
}

/** Business boundary for authenticated in-app feedback delivery. */
export class FeedbackService {
  constructor(private readonly emailSender: FeedbackEmailSender) {}

  async submit(input: SubmitFeedbackInput): Promise<void> {
    const feedback: FeedbackEmail = {
      category: input.category,
      message: input.message.trim()
    };

    // Guest addresses are synthetic; registered users can be replied to without
    // duplicating their identity in the feedback email body.
    if (
      input.submitterRole !== 'GUEST' &&
      input.submitterEmail &&
      input.submitterEmail.includes('@')
    ) {
      feedback.replyTo = input.submitterEmail;
    }

    await this.emailSender.sendFeedbackEmail(feedback);
  }
}
