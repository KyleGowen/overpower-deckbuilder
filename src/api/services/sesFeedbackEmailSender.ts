import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import type { FeedbackEmail, FeedbackEmailSender } from './feedbackService';

const DEFAULT_FEEDBACK_EMAIL = 'kyle@excelsior.cards';

export interface SesFeedbackEmailSenderOptions {
  client?: Pick<SESClient, 'send'>;
  region?: string;
  fromEmail?: string;
  toEmail?: string;
}

/** Sends in-app feedback through SES without logging or persisting message text. */
export class SesFeedbackEmailSender implements FeedbackEmailSender {
  private readonly client: Pick<SESClient, 'send'>;
  private readonly fromEmail: string;
  private readonly toEmail: string;

  constructor(options: SesFeedbackEmailSenderOptions = {}) {
    this.client = options.client ?? new SESClient({ region: options.region ?? process.env.AWS_REGION ?? 'us-west-2' });
    this.fromEmail = options.fromEmail ?? process.env.FEEDBACK_FROM_EMAIL ?? DEFAULT_FEEDBACK_EMAIL;
    this.toEmail = options.toEmail ?? process.env.FEEDBACK_TO_EMAIL ?? DEFAULT_FEEDBACK_EMAIL;
  }

  async sendFeedbackEmail(feedback: FeedbackEmail): Promise<void> {
    const categoryLabel = feedback.category === 'bug' ? 'Bug report' : 'Feature or change request';
    const body = [
      `Category: ${categoryLabel}`,
      `Submitted by: ${feedback.submitterName}`,
      `Email: ${feedback.submitterEmail}`,
      '',
      feedback.message
    ].join('\n');
    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: { ToAddresses: [this.toEmail] },
      Message: {
        Subject: { Charset: 'UTF-8', Data: `[Excelsior] ${categoryLabel}` },
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: body
          }
        }
      },
      ...(feedback.replyTo ? { ReplyToAddresses: [feedback.replyTo] } : {})
    });

    await this.client.send(command);
  }
}
