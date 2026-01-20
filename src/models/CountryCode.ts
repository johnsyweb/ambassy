/**
 * Country Code Type Definitions
 *
 * Defines TypeScript types for two-letter country codes based on TLDs (Top Level Domains)
 * used in parkrun URLs. These map to ISO 3166-1 alpha-2 codes where applicable.
 * 
 * Note: "uk" is used as the TLD (parkrun.co.uk) but maps to ISO code "gb" (United Kingdom).
 */

/**
 * Valid two-letter country codes used by parkrun (based on TLDs)
 * Most map directly to ISO 3166-1 alpha-2 codes, except "uk" which maps to "gb"
 */
export type CountryCode =
  | 'au' // Australia
  | 'uk' // United Kingdom (TLD, maps to ISO "gb")
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
  | 'my' // Malaysia
  | 'lt'; // Lithuania (and other future countries)

/**
 * Mapping from TLD (as used in parkrun URLs) to ISO 3166-1 alpha-2 code
 * Most TLDs map directly, but "uk" maps to "gb" (United Kingdom)
 */
const TLD_TO_ISO: ReadonlyMap<string, string> = new Map([
  ['au', 'au'],
  ['uk', 'gb'], // UK TLD maps to GB ISO code
  ['ie', 'ie'],
  ['nz', 'nz'],
  ['za', 'za'],
  ['us', 'us'],
  ['ca', 'ca'],
  ['it', 'it'],
  ['pl', 'pl'],
  ['de', 'de'],
  ['dk', 'dk'],
  ['se', 'se'],
  ['no', 'no'],
  ['fi', 'fi'],
  ['nl', 'nl'],
  ['fr', 'fr'],
  ['ru', 'ru'],
  ['jp', 'jp'],
  ['sg', 'sg'],
  ['my', 'my'],
  ['lt', 'lt'], // Lithuania
  // Add more countries as parkrun expands
]);

/**
 * Set of valid country codes (TLDs) for fast lookup
 * This allows for extensibility - new countries can be added without code changes
 * if they follow the pattern of using their TLD as the country code
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
  'lt',
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
 * Extracts a country code (TLD) from a parkrun domain URL
 * e.g., "www.parkrun.com.au" -> "au"
 *       "www.parkrun.co.za" -> "za"
 *       "www.parkrun.co.uk" -> "uk"
 *
 * @param url - The parkrun URL (e.g., "www.parkrun.com.au")
 * @returns The CountryCode (TLD) if valid, null otherwise
 */
export function extractCountryCodeFromUrl(url: string): CountryCode | null {
  // Remove www.parkrun. prefix if present
  const domain = url.replace(/^www\.parkrun\./, '');
  const domainParts = domain.split('.');
  const lastPart = domainParts[domainParts.length - 1].toLowerCase();
  
  return tryCountryCode(lastPart);
}

/**
 * Converts a TLD-based country code to ISO 3166-1 alpha-2 code
 * Most codes map directly, but "uk" maps to "gb"
 *
 * @param tldCode - The TLD-based country code (e.g., "uk", "au")
 * @returns The ISO 3166-1 alpha-2 code (e.g., "gb", "au") or the original code if no mapping exists
 */
export function tldToIso(tldCode: string): string {
  return TLD_TO_ISO.get(tldCode.toLowerCase()) || tldCode.toLowerCase();
}

/**
 * Checks if a TLD code has a special ISO mapping (e.g., "uk" -> "gb")
 *
 * @param tldCode - The TLD-based country code
 * @returns True if the TLD maps to a different ISO code
 */
export function hasIsoMapping(tldCode: string): boolean {
  const iso = TLD_TO_ISO.get(tldCode.toLowerCase());
  return iso !== undefined && iso !== tldCode.toLowerCase();
}
