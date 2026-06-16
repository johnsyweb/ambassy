import { EventDetailsMap } from "@models/EventDetailsMap";
import { normalizeEventName } from "@utils/fuzzyMatch";

export type CanonicalEventIndex = {
  exactMatches: Map<string, Set<string>>;
  lowercaseMatches: Map<string, Set<string>>;
  normalizedMatches: Map<string, Set<string>>;
};

let cachedIndex:
  | { eventDetails: EventDetailsMap; index: CanonicalEventIndex }
  | undefined;

export function buildCanonicalEventIndex(
  eventDetails: EventDetailsMap,
): CanonicalEventIndex {
  const exactMatches = new Map<string, Set<string>>();
  const lowercaseMatches = new Map<string, Set<string>>();
  const normalizedMatches = new Map<string, Set<string>>();

  for (const [key, event] of eventDetails) {
    const shortName = event.properties.EventShortName;
    addMatch(exactMatches, key, shortName);
    addMatch(exactMatches, shortName, shortName);
    addMatch(lowercaseMatches, shortName.toLowerCase(), shortName);
    addMatch(normalizedMatches, normalizeEventName(shortName), shortName);
  }

  return { exactMatches, lowercaseMatches, normalizedMatches };
}

export function getCanonicalEventIndex(
  eventDetails: EventDetailsMap,
): CanonicalEventIndex {
  if (cachedIndex?.eventDetails === eventDetails) {
    return cachedIndex.index;
  }

  const index = buildCanonicalEventIndex(eventDetails);
  cachedIndex = { eventDetails, index };
  return index;
}

export function clearCanonicalEventIndexCache(): void {
  cachedIndex = undefined;
}

export function findMatchesForCandidate(
  candidate: string,
  index: CanonicalEventIndex,
): Set<string> {
  const matches = new Set<string>();

  index.exactMatches.get(candidate)?.forEach((shortName) => {
    matches.add(shortName);
  });
  index.lowercaseMatches.get(candidate.toLowerCase())?.forEach((shortName) => {
    matches.add(shortName);
  });
  index.normalizedMatches
    .get(normalizeEventName(candidate))
    ?.forEach((shortName) => {
      matches.add(shortName);
    });

  return matches;
}

function addMatch(
  map: Map<string, Set<string>>,
  key: string,
  shortName: string,
): void {
  let matches = map.get(key);
  if (!matches) {
    matches = new Set<string>();
    map.set(key, matches);
  }
  matches.add(shortName);
}
