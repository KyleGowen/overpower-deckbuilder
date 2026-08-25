import request from 'supertest';
import { app, integrationTestUtils } from '../../setup-integration';

describe('v1 feedback integration', () => {
  let user: { id: string };

  beforeAll(async () => {
    user = await integrationTestUtils.createTestUser({
      name: 'v1_feedback_user',
      email: 'v1_feedback@example.com',
      role: 'USER'
    });
  });

  it('POST /api/v1/feedback rejects unauthenticated submissions', async () => {
    const response = await request(app)
      .post('/api/v1/feedback')
      .send({ category: 'bug', message: 'A problem' });
    expect(response.status).toBe(401);
    expect(response.body.errors[0].code).toBe('UNAUTHORIZED');
  });

  it('POST /api/v1/feedback validates its request model', async () => {
    const response = await request(app)
      .post('/api/v1/feedback')
      .set('x-test-user-id', user.id)
      .send({ category: 'feature', message: '   ' });
    expect(response.status).toBe(400);
    expect(response.body.errors[0]).toMatchObject({
      code: 'VALIDATION_ERROR',
      field: 'message'
    });
  });

  it('POST /api/v1/feedback accepts a categorized submission', async () => {
    const response = await request(app)
      .post('/api/v1/feedback')
      .set('x-test-user-id', user.id)
      .send({ category: 'feature', message: 'Add another card filter.' });
    expect(response.status).toBe(202);
    expect(response.body.data).toEqual({ submitted: true });
  });
});
