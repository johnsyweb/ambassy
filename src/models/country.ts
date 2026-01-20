import { Coordinate, getLatitude, getLongitude } from "@models/Coordinate";
import { getCountries as fetchCountries } from "@actions/fetchEvents";

export interface Country {
  url: string | null;
  bounds: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
}

export type CountryMap = {
  [key: string]: Country;
};

// Cache for countries to avoid repeated async calls
let countriesCache: CountryMap | null = null;
let countriesPromise: Promise<CountryMap> | null = null;

/**
 * Gets the countries map, loading from cache or fetching if needed
 */
export async function getCountries(): Promise<CountryMap> {
  if (countriesCache) {
    return countriesCache;
  }

  if (!countriesPromise) {
    countriesPromise = fetchCountries().then(countries => {
      countriesCache = countries;
      return countries;
    });
  }

  return countriesPromise;
}

/**
 * Gets countries synchronously from cache if available, otherwise returns empty map
 * Use this only when you know countries are already loaded
 */
export function getCountriesSync(): CountryMap {
  return countriesCache || {};
}

/**
 * Determines the country code for a given coordinate by checking which country's bounds contain it.
 * Returns the country code as a number, or 0 if no match is found.
 * 
 * @param coordinate - The coordinate to check
 * @returns The country code or 0 if not found
 */
export async function getCountryCodeFromCoordinate(coordinate: Coordinate): Promise<number> {
  const countries = await getCountries();
  const lat = getLatitude(coordinate);
  const lon = getLongitude(coordinate);

  // Check each country's bounds
  // Bounds format: [minLon, minLat, maxLon, maxLat]
  for (const [code, country] of Object.entries(countries)) {
    if (code === "0") continue; // Skip the default/unknown country

    const [minLon, minLat, maxLon, maxLat] = country.bounds;

    // Handle longitude wrapping (e.g., New Zealand spans the dateline)
    let lonMatches = false;
    if (minLon > maxLon) {
      // Country spans the dateline (e.g., New Zealand: 166.724 to -180)
      lonMatches = lon >= minLon || lon <= maxLon;
    } else {
      // Normal case: minLon < maxLon
      lonMatches = lon >= minLon && lon <= maxLon;
    }

    // Check if coordinate is within bounds
    if (lonMatches && lat >= minLat && lat <= maxLat) {
      return parseInt(code, 10);
    }
  }

  return 0; // Default/unknown
}

/**
 * Gets the country code from a parkrun domain by looking it up in the countries map.
 * Extracts the domain from URLs like "www.parkrun.com.au" or "parkrun.ca"
 * 
 * @param domain - The parkrun domain (e.g., "com.au", "ca", "co.uk")
 * @returns The country code, or 0 if not found
 */
export async function getCountryCodeFromDomain(domain: string): Promise<number> {
  const countries = await getCountries();
  // Normalize domain (remove www.parkrun. prefix if present)
  const normalizedDomain = domain.replace(/^(www\.)?parkrun\./, '');

  // Look up the domain in the countries map
  for (const [code, country] of Object.entries(countries)) {
    if (code === "0") continue; // Skip the default/unknown country
    
    if (country.url) {
      // Extract domain from URL (e.g., "www.parkrun.com.au" -> "com.au")
      const urlDomain = country.url.replace(/^www\.parkrun\./, '');
      if (urlDomain === normalizedDomain) {
        return parseInt(code, 10);
      }
    }
  }

  return 0; // Default/unknown
}

/**
 * Country code to country name mapping for common parkrun countries
 * Maps country codes to readable country names
 */
const COUNTRY_CODE_TO_NAME: Record<number, string> = {
  1: "United Kingdom",
  2: "Ireland",
  3: "Australia",
  4: "New Zealand",
  5: "South Africa",
  6: "United States",
  7: "Canada",
  8: "Italy",
  9: "Poland",
  10: "Germany",
  11: "Denmark",
  12: "Sweden",
  13: "Norway",
  14: "Finland",
  15: "Netherlands",
  16: "France",
  17: "Russia",
  18: "Japan",
  19: "Singapore",
  20: "Malaysia",
};

/**
 * Mapping from numeric country codes to two-letter ISO codes
 */
const COUNTRY_CODE_TO_ISO: Record<number, string> = {
  1: "UK",
  2: "IE",
  3: "AU",
  4: "NZ",
  5: "ZA",
  6: "US",
  7: "CA",
  8: "IT",
  9: "PL",
  10: "DE",
  11: "DK",
  12: "SE",
  13: "NO",
  14: "FI",
  15: "NL",
  16: "FR",
  17: "RU",
  18: "JP",
  19: "SG",
  20: "MY",
};

/**
 * Infers two-letter country code from coordinates.
 * Returns uppercase two-letter ISO 3166-1 alpha-2 code (e.g., "AU", "UK").
 * 
 * @param coordinate - The coordinate to infer country from
 * @returns Two-letter country code (e.g., "AU") or "Unknown" if inference fails
 */
export async function inferCountryCodeFromCoordinates(
  coordinate: Coordinate
): Promise<string> {
  const countryCode = await getCountryCodeFromCoordinate(coordinate);
  
  if (countryCode === 0) {
    return "Unknown";
  }
  
  // Check direct mapping first
  const isoCode = COUNTRY_CODE_TO_ISO[countryCode];
  if (isoCode) {
    return isoCode;
  }
  
  // Fallback: try to derive from country URL if available
  const countries = await getCountries();
  const country = countries[countryCode.toString()];
  if (country?.url) {
    // Extract domain and convert to two-letter code
    // e.g., "www.parkrun.com.au" -> "AU"
    const domain = country.url.replace(/^www\.parkrun\./, '');
    const domainParts = domain.split('.');
    const lastPart = domainParts[domainParts.length - 1].toUpperCase();
    
    // Map common domain parts to ISO codes
    const domainToISO: Record<string, string> = {
      'AU': 'AU',
      'UK': 'UK',
      'IE': 'IE',
      'NZ': 'NZ',
      'ZA': 'ZA',
      'US': 'US',
      'CA': 'CA',
      'IT': 'IT',
      'PL': 'PL',
      'DE': 'DE',
      'DK': 'DK',
      'SE': 'SE',
      'NO': 'NO',
      'FI': 'FI',
      'NL': 'NL',
      'FR': 'FR',
      'RU': 'RU',
      'JP': 'JP',
      'SG': 'SG',
      'MY': 'MY',
    };
    
    return domainToISO[lastPart] || lastPart || "Unknown";
  }
  
  return "Unknown";
}

/**
 * Infers country name string from coordinates.
 * Converts country code to a readable country name.
 * 
 * @param coordinate - The coordinate to infer country from
 * @returns Country name string (e.g., "Australia") or "Unknown" if inference fails
 */
export async function inferCountryFromCoordinates(
  coordinate: Coordinate
): Promise<string> {
  const countryCode = await getCountryCodeFromCoordinate(coordinate);
  
  if (countryCode === 0) {
    return "Unknown";
  }
  
  const countryName = COUNTRY_CODE_TO_NAME[countryCode];
  if (countryName) {
    return countryName;
  }
  
  // Fallback: try to derive from country URL if available
  const countries = await getCountries();
  const country = countries[countryCode.toString()];
  if (country?.url) {
    // Extract domain and convert to readable name
    // e.g., "www.parkrun.com.au" -> "Australia"
    const domain = country.url.replace(/^www\.parkrun\./, '');
    const domainParts = domain.split('.');
    const lastPart = domainParts[domainParts.length - 1];
    
    // Simple mapping for common domains (using CountryCode values)
    const domainToName: Record<string, string> = {
      'au': 'Australia',
      'uk': 'United Kingdom',
      'ie': 'Ireland',
      'nz': 'New Zealand',
      'za': 'South Africa',
      'us': 'United States',
      'ca': 'Canada',
      'it': 'Italy',
      'pl': 'Poland',
      'de': 'Germany',
      'dk': 'Denmark',
      'se': 'Sweden',
      'no': 'Norway',
      'fi': 'Finland',
      'nl': 'Netherlands',
      'fr': 'France',
      'ru': 'Russia',
      'jp': 'Japan',
      'sg': 'Singapore',
      'my': 'Malaysia',
    };
    
    return domainToName[lastPart] || domain || "Unknown";
  }
  
  return "Unknown";
}