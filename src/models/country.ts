import { Coordinate, getLatitude, getLongitude } from './Coordinate';
import { getCountries as fetchCountries } from '../actions/fetchEvents';

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