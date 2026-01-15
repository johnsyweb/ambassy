import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { normalizeEventName, levenshteinDistance } from "@utils/fuzzyMatch";

interface MatchResult {
  event: EventDetails;
  score: number;
  matchType: "exact" | "normalized" | "fuzzy";
}

const MAX_RESULTS = 10; // Limit results as per original spec
const FUZZY_THRESHOLD_SHORT = 1; // Allow small typos for short strings
const FUZZY_THRESHOLD_LONG = 2; // Allow small typos for long strings

export function searchEvents(query: string, events: EventDetailsMap): EventDetails[] {
  if (!query || query.trim() === "") {
    return [];
  }

  const matches: MatchResult[] = [];
  const processedEvents = new Set<string>();

  // Phase 1: Exact matches
  events.forEach((event) => {
    if (processedEvents.has(event.properties.EventShortName)) return;

    if (event.properties.EventShortName.toLowerCase() === query.toLowerCase() ||
        event.properties.EventLongName.toLowerCase() === query.toLowerCase() ||
        event.properties.eventname.toLowerCase() === query.toLowerCase() ||
        (event.properties.LocalisedEventLongName && event.properties.LocalisedEventLongName.toLowerCase() === query.toLowerCase())) {
      matches.push({
        event,
        score: 0,
        matchType: "exact",
      });
      processedEvents.add(event.properties.EventShortName);
    }
  });

  // Phase 2: Normalized matches (only if no exact matches found)
  if (matches.length === 0) {
    const normalizedQuery = normalizeEventName(query);
    events.forEach((event) => {
      if (processedEvents.has(event.properties.EventShortName)) return;

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

      for (const field of fields) {
        if (field.normalized === normalizedQuery ||
            normalizedQuery.includes(field.normalized) ||
            field.normalized.includes(normalizedQuery)) {
          matches.push({
            event,
            score: 1,
            matchType: "normalized",
          });
          processedEvents.add(event.properties.EventShortName);
          break;
        }
      }
    });
  }

  // Phase 3: Partial and fuzzy matches (only if no exact/normalized matches found)
  if (matches.length === 0) {
    const normalizedQuery = normalizeEventName(query);
    const queryLower = query.toLowerCase();

    events.forEach((event) => {
      if (processedEvents.has(event.properties.EventShortName)) return;

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

      let bestScore = Infinity;
      let matchType: "exact" | "normalized" | "fuzzy" = "fuzzy";

      // Check partial matches
      for (const field of fields) {
        if (field.name.toLowerCase().includes(queryLower)) {
          bestScore = 2;
          matchType = "fuzzy";
          break;
        }
      }

      // Check fuzzy matches
      if (bestScore > 2) {
        for (const field of fields) {
          const threshold =
            field.normalized.length < 10 ? FUZZY_THRESHOLD_SHORT : FUZZY_THRESHOLD_LONG;
          const distance = levenshteinDistance(field.normalized, normalizedQuery);

          if (distance <= threshold && distance > 0) {
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
        processedEvents.add(event.properties.EventShortName);
      }
    });
  }

  matches.sort((a, b) => {
    const typeOrder = { exact: 0, normalized: 1, fuzzy: 2 };
    if (a.matchType !== b.matchType) {
      return typeOrder[a.matchType] - typeOrder[b.matchType];
    }
    return a.score - b.score;
  });

  return matches.slice(0, MAX_RESULTS).map((match) => match.event);
}
