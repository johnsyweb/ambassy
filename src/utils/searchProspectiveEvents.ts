import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { levenshteinDistance, normalizeEventName } from "@utils/fuzzyMatch";

export const PROSPECTIVE_EVENT_SEARCH_MAX_RESULTS = 10;
const FUZZY_THRESHOLD_SHORT = 1;
const FUZZY_THRESHOLD_LONG = 2;

export function searchProspectiveEvents(
  query: string,
  prospects: ProspectiveEvent[],
): ProspectiveEvent[] {
  if (!query || query.trim() === "") {
    return [];
  }

  const queryLower = query.toLowerCase();
  const normalizedQuery = normalizeEventName(query);
  const matches: Array<{ prospect: ProspectiveEvent; score: number }> = [];

  for (const prospect of prospects) {
    const name = prospect.prospectEvent;
    const nameLower = name.toLowerCase();
    const normalizedName = normalizeEventName(name);

    if (nameLower === queryLower || normalizedName === normalizedQuery) {
      matches.push({ prospect, score: 0 });
      continue;
    }

    if (
      nameLower.includes(queryLower) ||
      normalizedName.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedName)
    ) {
      matches.push({ prospect, score: 1 });
      continue;
    }

    const threshold =
      normalizedName.length < 10 ? FUZZY_THRESHOLD_SHORT : FUZZY_THRESHOLD_LONG;
    const distance = levenshteinDistance(normalizedName, normalizedQuery);
    if (distance > 0 && distance <= threshold) {
      matches.push({ prospect, score: 100 + distance });
    }
  }

  matches.sort((a, b) => a.score - b.score);

  return matches
    .slice(0, PROSPECTIVE_EVENT_SEARCH_MAX_RESULTS)
    .map(({ prospect }) => prospect);
}
