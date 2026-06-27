import type { V1ErrorBody } from '../../v1Envelope';

const MAX_DISPLAY_NAME = 255;

/**
 * Validated POST /api/v1/users/display-name JSON body.
 *
 * `displayName` is the single user-supplied field. Semantics depend on the user's
 * auth provider and are enforced in UserAccountService:
 * - password users: this becomes their new (globally-unique) username/login id.
 * - SSO users: this becomes their display_name only.
 */
export class SetDisplayNameRequestBody {
  readonly displayName: string;

  private constructor(displayName: string) {
    this.displayName = displayName;
  }

  static parse(
    body: unknown
  ): { ok: true; value: SetDisplayNameRequestBody } | { ok: false; errors: V1ErrorBody[] } {
    if (body === null || typeof body !== 'object') {
      return { ok: false, errors: [{ code: 'VALIDATION_ERROR', message: 'JSON body is required' }] };
    }
    const o = body as Record<string, unknown>;
    const displayName = o.displayName;
    if (typeof displayName !== 'string' || !displayName.trim()) {
      return {
        ok: false,
        errors: [{ code: 'VALIDATION_ERROR', message: 'Display name is required', field: 'displayName' }]
      };
    }
    const trimmed = displayName.trim();
    if (trimmed.length > MAX_DISPLAY_NAME) {
      return {
        ok: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message: `Display name must be ${MAX_DISPLAY_NAME} characters or fewer`,
            field: 'displayName'
          }
        ]
      };
    }
    return { ok: true, value: new SetDisplayNameRequestBody(trimmed) };
  }
}
