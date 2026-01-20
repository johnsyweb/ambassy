/**
 * Country Code Type Definitions
 *
 * Defines TypeScript types for two-letter ISO 3166-1 alpha-2 country codes
 * used throughout the application for validation and type safety.
 */

/**
 * Valid two-letter country codes used by parkrun
 * Based on ISO 3166-1 alpha-2 standard
 */
export type CountryCode =
  | 'au' // Australia
  | 'uk' // United Kingdom
  | 'ie' // Ireland
  | 'nz' // New Zealand
  | 'za' // South Africa
  | 'us' // United States
  | 'ca' // Canada
  | 'it' // Italy
  | 'pl' // Poland
  | 'de' // Germany
  | 'dk' // Denmark
  | 'se' // Sweden
  | 'no' // Norway
  | 'fi' // Finland
  | 'nl' // Netherlands
  | 'fr' // France
  | 'ru' // Russia
  | 'jp' // Japan
  | 'sg' // Singapore
  | 'my'; // Malaysia

/**
 * Set of valid country codes for fast lookup
 */
const VALID_COUNTRY_CODES: ReadonlySet<CountryCode> = new Set([
  'au',
  'uk',
  'ie',
  'nz',
  'za',
  'us',
  'ca',
  'it',
  'pl',
  'de',
  'dk',
  'se',
  'no',
  'fi',
  'nl',
  'fr',
  'ru',
  'jp',
  'sg',
  'my',
]);

/**
 * Validates if a string is a valid two-letter country code
 *
 * @param code - The string to validate
 * @returns True if the code is valid, false otherwise
 */
export function isValidCountryCode(code: string): code is CountryCode {
  return VALID_COUNTRY_CODES.has(code as CountryCode);
}

/**
 * Type guard to check if a value is a valid CountryCode
 *
 * @param code - The value to check
 * @returns True if the value is a valid CountryCode
 */
export function isCountryCode(code: unknown): code is CountryCode {
  return typeof code === 'string' && isValidCountryCode(code);
}

/**
 * Converts a string to a CountryCode, throwing if invalid
 *
 * @param code - The string to convert
 * @returns The validated CountryCode
 * @throws Error if the code is not a valid country code
 */
export function toCountryCode(code: string): CountryCode {
  if (!isValidCountryCode(code)) {
    throw new Error(`Invalid country code: "${code}". Must be a valid two-letter ISO 3166-1 alpha-2 code.`);
  }
  return code;
}

/**
 * Safely converts a string to a CountryCode, returning null if invalid
 *
 * @param code - The string to convert
 * @returns The CountryCode if valid, null otherwise
 */
export function tryCountryCode(code: string): CountryCode | null {
  return isValidCountryCode(code) ? code : null;
}

/**
 * Extracts a country code from a parkrun domain URL
 * e.g., "www.parkrun.com.au" -> "au"
 *       "www.parkrun.co.za" -> "za"
 *
 * @param url - The parkrun URL (e.g., "www.parkrun.com.au")
 * @returns The CountryCode if valid, null otherwise
 */
export function extractCountryCodeFromUrl(url: string): CountryCode | null {
  // Remove www.parkrun. prefix if present
  const domain = url.replace(/^www\.parkrun\./, '');
  const domainParts = domain.split('.');
  const lastPart = domainParts[domainParts.length - 1];
  
  return tryCountryCode(lastPart);
}
