/** Maps API auth provider fields to a single value for UI gating. */
export function resolveAuthProvider(
  raw: { authProvider?: string | null; auth_provider?: string | null } | null | undefined
): string {
  return raw?.authProvider ?? raw?.auth_provider ?? 'password';
}
