import express, { type Request, type RequestHandler } from 'express';
import request from 'supertest';
import {
  registerFeedbackV1HttpRoutes,
  type FeedbackV1HttpDeps
} from '../../../../src/api/http/feedback.http';
import { resetV1RateLimitBucketsForTests } from '../../../../src/api/http/middleware/v1RateLimit';
import type { FeedbackService } from '../../../../src/api/services/feedbackService';

const passAuth: RequestHandler = (req: Request, _res, next) => {
  req.user = {
    id: 'user-1',
    name: 'Feedback User',
    email: 'feedback@example.com',
    role: 'USER'
  };
  next();
};

const guestAuth: RequestHandler = (req: Request, _res, next) => {
  req.user = {
    id: 'guest-1',
    name: 'Guest',
    email: 'guest@example.com',
    role: 'GUEST'
  };
  next();
};

const rejectAuth: RequestHandler = (_req, res) => {
  res.status(401).json({ data: null, errors: [{ code: 'UNAUTHORIZED' }] });
};

function buildApp(deps: FeedbackV1HttpDeps): express.Application {
  const app = express();
  app.use(express.json());
  const router = express.Router();
  registerFeedbackV1HttpRoutes(router, deps);
  app.use(router);
  return app;
}

function stubFeedbackService(): jest.Mocked<Pick<FeedbackService, 'submit'>> {
  return { submit: jest.fn().mockResolvedValue(undefined) };
}

describe('feedback.http', () => {
  beforeEach(() => resetV1RateLimitBucketsForTests());

  it('accepts an authenticated bug report and returns a v1 envelope', async () => {
    const feedbackService = stubFeedbackService();
    const response = await request(
      buildApp({ feedbackService, authenticateUser: passAuth })
    )
      .post('/feedback')
      .send({ category: 'bug', message: '  Deck save failed.  ' })
      .expect(202);

    expect(response.body.data).toEqual({ submitted: true });
    expect(feedbackService.submit).toHaveBeenCalledWith({
      category: 'bug',
      message: 'Deck save failed.',
      submitterEmail: 'feedback@example.com',
      submitterRole: 'USER'
    });
    expect(response.headers['x-ratelimit-limit']).toBe('5');
  });

  it('allows authenticated guests to submit feedback', async () => {
    const feedbackService = stubFeedbackService();
    await request(
      buildApp({ feedbackService, authenticateUser: guestAuth })
    )
      .post('/feedback')
      .send({ category: 'feature', message: 'Add another filter.' })
      .expect(202);

    expect(feedbackService.submit).toHaveBeenCalledWith({
      category: 'feature',
      message: 'Add another filter.',
      submitterEmail: 'guest@example.com',
      submitterRole: 'GUEST'
    });
  });

  it.each([
    [{ category: 'other', message: 'Hello' }, 'category'],
    [{ category: 'bug', message: '   ' }, 'message'],
    [{ category: 'bug', message: 'a'.repeat(4001) }, 'message'],
    [{ category: 'bug', message: 'Hello', extra: true }, '']
  ])('rejects an invalid body %#', async (body, field) => {
    const feedbackService = stubFeedbackService();
    const response = await request(
      buildApp({ feedbackService, authenticateUser: passAuth })
    )
      .post('/feedback')
      .send(body)
      .expect(400);

    expect(response.body.errors[0].code).toBe('VALIDATION_ERROR');
    if (field) expect(response.body.errors[0].field).toBe(field);
    expect(feedbackService.submit).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated submissions', async () => {
    const feedbackService = stubFeedbackService();
    await request(
      buildApp({ feedbackService, authenticateUser: rejectAuth })
    )
      .post('/feedback')
      .send({ category: 'bug', message: 'Hello' })
      .expect(401);
    expect(feedbackService.submit).not.toHaveBeenCalled();
  });

  it('maps delivery failures without reflecting feedback text', async () => {
    const feedbackService = stubFeedbackService();
    feedbackService.submit.mockRejectedValueOnce(new Error('SES unavailable'));
    const response = await request(
      buildApp({ feedbackService, authenticateUser: passAuth })
    )
      .post('/feedback')
      .send({ category: 'bug', message: 'Sensitive feedback body' })
      .expect(500);

    expect(response.body.errors[0]).toEqual({
      code: 'FEEDBACK_DELIVERY_ERROR',
      message: 'Could not send feedback. Please try again.'
    });
    expect(JSON.stringify(response.body)).not.toContain('Sensitive feedback body');
  });

  it('limits feedback to five submissions per minute per authenticated user', async () => {
    const feedbackService = stubFeedbackService();
    const app = buildApp({ feedbackService, authenticateUser: passAuth });

    for (let index = 0; index < 5; index += 1) {
      await request(app)
        .post('/feedback')
        .send({ category: 'bug', message: `Report ${index}` })
        .expect(202);
    }
    const response = await request(app)
      .post('/feedback')
      .send({ category: 'bug', message: 'One too many' })
      .expect(429);

    expect(response.body.errors[0].code).toBe('RATE_LIMITED');
    expect(feedbackService.submit).toHaveBeenCalledTimes(5);
  });
});
