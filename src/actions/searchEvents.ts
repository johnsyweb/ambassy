import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { normalizeEventName, levenshteinDistance } from "../utils/fuzzyMatch";

interface MatchResult {
  event: EventDetails;
  score: number;
  matchType: "exact" | "normalized" | "fuzzy";
}

const MAX_RESULTS = 10; // Limit results as per original spec
const FUZZY_THRESHOLD_SHORT = 2; // More strict
const FUZZY_THRESHOLD_LONG = 3; // More strict

export function searchEvents(query: string, events: EventDetailsMap): EventDetails[] {
  if (!query || query.trim() === "") {
    return [];
  }

  const normalizedQuery = normalizeEventName(query);
  const matches: MatchResult[] = [];

  events.forEach((event) => {
    let bestScore = Infinity;
    let matchType: "exact" | "normalized" | "fuzzy" = "fuzzy";

    // Check all name fields for matches
    const fields = [
      { name: event.properties.EventShortName, normalized: normalizeEventName(event.properties.EventShortName) },
      { name: event.properties.EventLongName, normalized: normalizeEventName(event.properties.EventLongName) },
      { name: event.properties.eventname, normalized: normalizeEventName(event.properties.eventname) },
    ];

    if (event.properties.LocalisedEventLongName) {
      fields.push({
        name: event.properties.LocalisedEventLongName,
        normalized: normalizeEventName(event.properties.LocalisedEventLongName),
      });
    }

    // 1. Exact matches (highest priority)
    for (const field of fields) {
      if (field.name.toLowerCase() === query.toLowerCase()) {
        console.log(`EXACT MATCH: "${query}" matches "${field.name}" in event ${event.properties.EventShortName}`);
        matches.push({
          event,
          score: 0,
          matchType: "exact",
        });
        return; // Only add exact matches once per event
      }
    }

    // 2. Normalized matches (second priority)
    if (bestScore > 0) {  // Only check if no exact match found
      for (const field of fields) {
        if (field.normalized === normalizedQuery) {
          bestScore = 1;
          matchType = "normalized";
          break;
        }
      }
    }

    // 3. Fuzzy matches (lowest priority)
    if (bestScore > 1) {
      for (const field of fields) {
        const threshold =
          field.normalized.length < 10 ? FUZZY_THRESHOLD_SHORT : FUZZY_THRESHOLD_LONG;
        const distance = levenshteinDistance(field.normalized, normalizedQuery);

        if (distance <= threshold) {
          const fuzzyScore = 100 + distance;
          if (bestScore > fuzzyScore) {
            bestScore = fuzzyScore;
            matchType = "fuzzy";
          }
        }
      }
    }

    if (bestScore < Infinity) {
      matches.push({
        event,
        score: bestScore,
        matchType,
      });
    }
  });

  matches.sort((a, b) => {
    const typeOrder = { exact: 0, normalized: 1, fuzzy: 2 };
    if (a.matchType !== b.matchType) {
      return typeOrder[a.matchType] - typeOrder[b.matchType];
    }
    return a.score - b.score;
  });

  return matches.slice(0, MAX_RESULTS).map((match) => match.event);
}
