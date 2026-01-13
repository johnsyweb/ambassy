import { CountryMap } from '../models/country';

/**
 * Builds the event history URL for a parkrun event
 * 
 * @param eventShortName - The event's short name (e.g., "albertmelbourne")
 * @param countrycode - The event's country code (e.g., 3 for Australia)
 * @param countries - Map of country codes to Country objects
 * @returns The constructed URL or null if construction is not possible
 */
export function buildEventHistoryUrl(
  eventShortName: string,
  countrycode: number,
  countries: CountryMap
): string | null {
  // Validate eventShortName
  if (!eventShortName || !eventShortName.trim()) {
    return null;
  }

  // Validate countrycode
  if (!countrycode || countrycode === 0) {
    return null;
  }

  // Lookup country by code (convert number to string for map lookup)
  const countryCodeStr = countrycode.toString();
  const country = countries[countryCodeStr];

  if (!country) {
    return null;
  }

  // Validate country.url is not null
  if (!country.url) {
    return null;
  }

  // Construct URL: https://${country.url}/${eventShortName}/results/eventhistory/
  return `https://${country.url}/${eventShortName}/results/eventhistory/`;
}
