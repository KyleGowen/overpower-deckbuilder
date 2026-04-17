import type { Response } from 'express';

export interface V1Meta {
  requestId?: string;
  catalogDataVersion?: number;
  catalogLastUpdated?: string;
}

export interface V1ErrorBody {
  code: string;
  message: string;
  field?: string;
}

export interface V1Envelope<T> {
  data: T | null;
  meta: V1Meta;
  errors: V1ErrorBody[];
}

export function sendV1Json<T>(res: Response, status: number, data: T | null, errors: V1ErrorBody[] = []): void {
  const body: V1Envelope<T> = { data, meta: {}, errors };
  res.status(status).type('application/json').json(body);
}

export function sendV1Success<T>(res: Response, data: T, status = 200): void {
  sendV1Json(res, status, data, []);
}

/** Session/Bearer missing or invalid for `/api/v1` routes (per v1 contract). */
export function sendV1Unauthorized(res: Response, message: string): void {
  sendV1Json(res, 401, null, [{ code: 'UNAUTHORIZED', message }]);
}
