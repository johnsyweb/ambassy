import { getCountries } from "../models/country";

export function normalizeEventName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Generates a URL-friendly event name for parkrun URLs
 * Removes parenthetic strings, punctuation, whitespace, converts to lowercase
 */
export function generateUrlFriendlyName(eventName: string): string {
  return eventName
    .toLowerCase()
    .replace(/\([^)]*\)/g, "") // Remove parenthetic content
    .replace(/[^\w\s-]/g, "") // Remove punctuation except hyphens
    .replace(/\s+/g, "") // Remove whitespace
    .trim();
}

/**
 * Suggests a parkrun URL based on event name and country
 */
export async function suggestParkrunUrl(eventName: string, countryCode: number = 0): Promise<string> {
  const urlName = generateUrlFriendlyName(eventName);
  const countries = await getCountries();

  // Look up domain from country code dynamically
  const country = countries[countryCode.toString()];
  let domain = 'com.au'; // Default to Australia
  
  if (country && country.url) {
    // Extract domain from URL (e.g., "www.parkrun.com.au" -> "com.au")
    domain = country.url.replace(/^www\.parkrun\./, '');
  } else if (countryCode === 0) {
    // If no country code provided, default to Australia (code 3)
    const australia = countries["3"];
    if (australia && australia.url) {
      domain = australia.url.replace(/^www\.parkrun\./, '');
    }
  }

  return `https://www.parkrun.${domain}/${urlName}/`;
}
