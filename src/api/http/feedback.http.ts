import type { RequestHandler, Router } from 'express';
import type { FeedbackSubmitV1DataDto } from '../dto/v1/FeedbackSubmitV1DataDto';
import type { FeedbackService } from '../services/feedbackService';
import { createV1RateLimit } from './middleware/v1RateLimit';
import { SubmitFeedbackRequestBody } from './models/feedback/SubmitFeedbackRequestBody';
import { parseV1Body } from './parseV1Body';
import { sendV1Json, sendV1Success } from './v1Envelope';

export interface FeedbackV1HttpDeps {
  feedbackService: Pick<FeedbackService, 'submit'>;
  authenticateUser: RequestHandler;
}

export function registerFeedbackV1HttpRoutes(router: Router, deps: FeedbackV1HttpDeps): void {
  router.post(
    '/feedback',
    deps.authenticateUser,
    createV1RateLimit({ routeKey: 'feedback' }),
    async (req, res) => {
      if (!req.user) {
        sendV1Json(res, 401, null, [
          { code: 'UNAUTHORIZED', message: 'Authentication required' }
        ]);
        return;
      }

      const parsed = parseV1Body(SubmitFeedbackRequestBody, req.body, res);
      if (!parsed) return;

      try {
        await deps.feedbackService.submit({
          category: parsed.value.category,
          message: parsed.value.message,
          submitterRole: req.user.role,
          ...(req.user.email ? { submitterEmail: req.user.email } : {})
        });
        const data: FeedbackSubmitV1DataDto = { submitted: true };
        sendV1Success(res, data, 202);
      } catch (error) {
        console.error('v1 POST /feedback delivery error:', error);
        sendV1Json(res, 500, null, [
          { code: 'FEEDBACK_DELIVERY_ERROR', message: 'Could not send feedback. Please try again.' }
        ]);
      }
    }
  );
}
