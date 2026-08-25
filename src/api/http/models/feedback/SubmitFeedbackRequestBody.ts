import { z } from 'zod';

export const FEEDBACK_MESSAGE_MAX_LENGTH = 4000;

/** Validated POST /api/v1/feedback JSON body. */
export const SubmitFeedbackRequestBody = z
  .object({
    category: z.enum(['bug', 'feature'], {
      message: 'Category must be bug or feature'
    }),
    message: z
      .string({ message: 'Feedback is required' })
      .trim()
      .min(1, 'Feedback is required')
      .max(
        FEEDBACK_MESSAGE_MAX_LENGTH,
        `Feedback must be ${FEEDBACK_MESSAGE_MAX_LENGTH} characters or fewer`
      )
  })
  .strict();

export type SubmitFeedbackRequest = z.infer<typeof SubmitFeedbackRequestBody>;
