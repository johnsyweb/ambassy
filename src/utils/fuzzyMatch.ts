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
export function suggestParkrunUrl(eventName: string, countryCode: number = 13): string {
  const urlName = generateUrlFriendlyName(eventName);

  // Map country codes to domains (based on parkrun country codes)
  const countryDomains: Record<number, string> = {
    13: 'com.au',    // Australia
    1: 'co.uk',      // United Kingdom
    2: 'com',        // United States
    3: 'ca',         // Canada
    4: 'co.za',      // South Africa
    5: 'de',         // Germany
    6: 'fr',         // France
    7: 'it',         // Italy
    8: 'co.nz',      // New Zealand
    9: 'pl',         // Poland
    10: 'se',        // Sweden
    11: 'no',        // Norway
    12: 'dk',        // Denmark
    14: 'ie',        // Ireland
    15: 'fi',        // Finland
    16: 'nl',        // Netherlands
    17: 'sg',        // Singapore
    18: 'my',        // Malaysia
    19: 'jp',        // Japan
    20: 'at',        // Austria
    21: 'be',        // Belgium
    22: 'lu',        // Luxembourg
    23: 'ru',        // Russia
    24: 'cz',        // Czech Republic
    25: 'sk',        // Slovakia
    26: 'si',        // Slovenia
    27: 'ee',        // Estonia
    28: 'lv',        // Latvia
    29: 'lt',        // Lithuania
    30: 'hu',        // Hungary
    31: 'ro',        // Romania
    32: 'bg',        // Bulgaria
    33: 'hr',        // Croatia
    34: 'ba',        // Bosnia and Herzegovina
    35: 'me',        // Montenegro
    36: 'mk',        // North Macedonia
    37: 'al',        // Albania
    38: 'gr',        // Greece
    39: 'tr',        // Turkey
    40: 'pt',        // Portugal
    41: 'es',        // Spain
    42: 'mt',        // Malta
    43: 'is',        // Iceland
    44: 'ch',        // Switzerland
    45: 'li',        // Liechtenstein
  };

  const domain = countryDomains[countryCode] || 'com.au'; // Default to Australia
  return `https://www.parkrun.${domain}/${urlName}/`;
}
