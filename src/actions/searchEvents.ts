import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { normalizeEventName, levenshteinDistance } from "../utils/fuzzyMatch";

interface MatchResult {
  event: EventDetails;
  score: number;
  matchType: "exact" | "normalized" | "fuzzy";
}

const MAX_RESULTS = 10;
const FUZZY_THRESHOLD_SHORT = 2;
const FUZZY_THRESHOLD_LONG = 3;

export function searchEvents(query: string, events: EventDetailsMap): EventDetails[] {
  if (!query || query.trim() === "") {
    return [];
  }

  const normalizedQuery = normalizeEventName(query);
  const matches: MatchResult[] = [];

  events.forEach((event) => {
    const shortName = normalizeEventName(event.properties.EventShortName);
    const longName = normalizeEventName(event.properties.EventLongName);
    const eventName = normalizeEventName(event.properties.eventname);
    const localisedName = event.properties.LocalisedEventLongName
      ? normalizeEventName(event.properties.LocalisedEventLongName)
      : null;

    let bestScore = Infinity;
    let matchType: "exact" | "normalized" | "fuzzy" = "fuzzy";

    const fields = [
      { name: event.properties.EventShortName, normalized: shortName },
      { name: event.properties.EventLongName, normalized: longName },
      { name: event.properties.eventname, normalized: eventName },
    ];

    if (localisedName) {
      fields.push({
        name: event.properties.LocalisedEventLongName!,
        normalized: localisedName,
      });
    }

    let foundExact = false;
    let foundNormalized = false;

    for (const field of fields) {
      if (field.name.toLowerCase() === query.toLowerCase()) {
        bestScore = 0;
        matchType = "exact";
        foundExact = true;
        break;
      } else if (field.normalized === normalizedQuery) {
        if (!foundExact) {
          bestScore = 1;
          matchType = "normalized";
          foundNormalized = true;
        }
      }
    }

    if (!foundExact && !foundNormalized) {
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
    if (a.matchType !== b.matchType) {
      const typeOrder = { exact: 0, normalized: 1, fuzzy: 2 };
      return typeOrder[a.matchType] - typeOrder[b.matchType];
    }
    return a.score - b.score;
  });

  return matches.slice(0, MAX_RESULTS).map((match) => match.event);
}
