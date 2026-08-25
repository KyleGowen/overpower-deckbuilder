import { FeedbackService, type FeedbackEmailSender } from '../../../../src/api/services/feedbackService';

describe('FeedbackService', () => {
  it('sends category, trimmed message, and a registered-user reply-to address', async () => {
    const sender: jest.Mocked<FeedbackEmailSender> = {
      sendFeedbackEmail: jest.fn().mockResolvedValue(undefined)
    };
    const service = new FeedbackService(sender);

    await service.submit({
      category: 'feature',
      message: '  Add a compact deck view.  ',
      submitterEmail: 'player@example.com',
      submitterRole: 'USER'
    });

    expect(sender.sendFeedbackEmail).toHaveBeenCalledWith({
      category: 'feature',
      message: 'Add a compact deck view.',
      replyTo: 'player@example.com'
    });
  });

  it('does not use a guest address as reply-to', async () => {
    const sender: jest.Mocked<FeedbackEmailSender> = {
      sendFeedbackEmail: jest.fn().mockResolvedValue(undefined)
    };
    const service = new FeedbackService(sender);

    await service.submit({
      category: 'bug',
      message: 'Something broke.',
      submitterEmail: 'guest@example.com',
      submitterRole: 'GUEST'
    });

    expect(sender.sendFeedbackEmail).toHaveBeenCalledWith({
      category: 'bug',
      message: 'Something broke.'
    });
  });
});
