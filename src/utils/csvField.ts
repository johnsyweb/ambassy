/**
 * Normalise a parsed CSV cell for string fields. Extra columns are not read;
 * only callers pass whitelisted keys into models.
 */
export function csvStringCell(value: unknown): string {
  if (value == null) {
    return "";
  }
  return String(value);
}
