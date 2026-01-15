import { CountryMap } from "@models/country";

/**
 * Builds the event history URL for a parkrun event
 * 
 * @param eventname - The event's eventname property or any human-readable variant
 *                    (e.g., "kirkdalereserve", "Albertonascot parkrun")
 * @param countrycode - The event's country code (e.g., 3 for Australia)
 * @param countries - Map of country codes to Country objects
 * @returns The constructed URL or null if construction is not possible
 */
export function buildEventHistoryUrl(
  eventname: string,
  countrycode: number,
  countries: CountryMap
): string | null {
  // Validate eventname
  if (!eventname || !eventname.trim()) {
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

  // Normalise eventname to a URL-safe slug:
  // - Trim whitespace
  // - Remove trailing " parkrun" suffix (case-insensitive)
  // - Lowercase
  // - Collapse all internal whitespace
  const slug = eventname
    .trim()
    .replace(/\s+parkrun$/i, "")
    .toLowerCase()
    .replace(/\s+/g, "");

  // Construct URL: https://${country.url}/${slug}/results/eventhistory/
  return `https://${country.url}/${slug}/results/eventhistory/`;
}
