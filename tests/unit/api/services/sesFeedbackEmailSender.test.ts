import { SendEmailCommand } from '@aws-sdk/client-ses';
import { SesFeedbackEmailSender } from '../../../../src/api/services/sesFeedbackEmailSender';

describe('SesFeedbackEmailSender', () => {
  it('builds a categorized SES email to Kyle', async () => {
    const send = jest.fn().mockResolvedValue({ MessageId: 'message-1' });
    const sender = new SesFeedbackEmailSender({
      client: { send } as never,
      fromEmail: 'kyle@excelsior.cards',
      toEmail: 'kyle@excelsior.cards'
    });

    await sender.sendFeedbackEmail({
      category: 'bug',
      message: 'Deck save failed after changing the background.',
      submitterName: 'Player One',
      submitterEmail: 'player@example.com',
      replyTo: 'player@example.com'
    });

    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0][0] as SendEmailCommand;
    expect(command.input).toEqual({
      Source: 'kyle@excelsior.cards',
      Destination: { ToAddresses: ['kyle@excelsior.cards'] },
      Message: {
        Subject: { Charset: 'UTF-8', Data: '[Excelsior] Bug report' },
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: 'Category: Bug report\nSubmitted by: Player One\nEmail: player@example.com\n\nDeck save failed after changing the background.'
          }
        }
      },
      ReplyToAddresses: ['player@example.com']
    });
  });

  it('labels feature requests and omits reply-to when none is supplied', async () => {
    const send = jest.fn().mockResolvedValue({ MessageId: 'message-2' });
    const sender = new SesFeedbackEmailSender({ client: { send } as never });

    await sender.sendFeedbackEmail({
      category: 'feature',
      message: 'Add a sort option.',
      submitterName: 'Guest',
      submitterEmail: 'guest@example.com'
    });

    const command = send.mock.calls[0][0] as SendEmailCommand;
    expect(command.input.Message?.Subject?.Data).toBe('[Excelsior] Feature or change request');
    expect(command.input.Message?.Body?.Text?.Data).toContain('Category: Feature or change request');
    expect(command.input.Message?.Body?.Text?.Data).toContain('Submitted by: Guest');
    expect(command.input.Message?.Body?.Text?.Data).toContain('Email: guest@example.com');
    expect(command.input.ReplyToAddresses).toBeUndefined();
  });
});
