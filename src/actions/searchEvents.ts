import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { normalizeEventName, levenshteinDistance } from "../utils/fuzzyMatch";

interface MatchResult {
  event: EventDetails;
  score: number;
  matchType: "exact" | "normalized" | "fuzzy";
}

const MAX_RESULTS = 20; // Increased to show more suggestions
const FUZZY_THRESHOLD_SHORT = 3; // More lenient
const FUZZY_THRESHOLD_LONG = 5; // More lenient

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
    let foundSubstring = false;

    // Check for exact matches first
    for (const field of fields) {
      if (field.name.toLowerCase() === query.toLowerCase()) {
        bestScore = 0;
        matchType = "exact";
        foundExact = true;
        break;
      }
    }

    if (!foundExact) {
      // Check for normalized matches
      for (const field of fields) {
        if (field.normalized === normalizedQuery) {
          bestScore = 1;
          matchType = "normalized";
          foundNormalized = true;
          break;
        }
      }
    }

    if (!foundExact && !foundNormalized) {
      // Check for substring matches (query contained in field)
      for (const field of fields) {
        if (field.normalized.includes(normalizedQuery) ||
            field.name.toLowerCase().includes(query.toLowerCase())) {
          const substringScore = 10 + (field.normalized.length - normalizedQuery.length); // Prefer shorter matches
          if (bestScore > substringScore) {
            bestScore = substringScore;
            matchType = "fuzzy";
            foundSubstring = true;
          }
        }
      }

      // Check for word-based matches (all query words appear in field)
      if (!foundSubstring && normalizedQuery.split(' ').length > 1) {
        const queryWords = normalizedQuery.split(' ').filter(word => word.length > 2); // Ignore short words
        for (const field of fields) {
          const fieldWords = field.normalized.split(' ');
          const matchedWords = queryWords.filter(qWord =>
            fieldWords.some(fWord => fWord.includes(qWord) || qWord.includes(fWord))
          );
          if (matchedWords.length === queryWords.length) {
            const wordScore = 20 + (queryWords.length - matchedWords.length) * 5;
            if (bestScore > wordScore) {
              bestScore = wordScore;
              matchType = "fuzzy";
            }
          }
        }
      }

      // Finally, check fuzzy matches
      if (!foundSubstring) {
        for (const field of fields) {
          const threshold = Math.min(
            FUZZY_THRESHOLD_LONG,
            Math.max(FUZZY_THRESHOLD_SHORT, Math.floor(normalizedQuery.length * 0.3)) // Adaptive threshold
          );
          const distance = levenshteinDistance(field.normalized, normalizedQuery);
          if (distance <= threshold) {
            const fuzzyScore = 50 + distance; // Lower than substring scores
            if (bestScore > fuzzyScore) {
              bestScore = fuzzyScore;
              matchType = "fuzzy";
            }
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
      console.log(`Match found: "${query}" -> "${event.properties.EventLongName}" (score: ${bestScore}, type: ${matchType})`);
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
