/** Normalize validation failures into a string list for display. */
export function normalizeValidationErrors(
  validationErrors?: string[],
  message?: string,
): string[] {
  if (validationErrors && validationErrors.length > 0) {
    return validationErrors;
  }
  if (!message) return [];
  return message
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);
}
