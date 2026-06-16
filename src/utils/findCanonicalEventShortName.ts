import { EventDetailsMap } from "@models/EventDetailsMap";
import { normalizeEventName } from "@utils/fuzzyMatch";

export function findCanonicalEventShortName(
  name: string,
  eventDetails: EventDetailsMap,
): string | undefined {
  if (!name.trim()) {
    return undefined;
  }

  for (const candidate of buildMatchCandidates(name)) {
    const matches = findMatchesForCandidate(candidate, eventDetails);
    if (matches.size > 1) {
      return undefined;
    }
    if (matches.size === 1) {
      return [...matches][0];
    }
  }

  return undefined;
}

function buildMatchCandidates(name: string): string[] {
  const candidates = [name];

  if (name.includes(",")) {
    const prefix = name.split(",")[0]?.trim();
    if (prefix && prefix !== name) {
      candidates.push(prefix);
    }
  }

  return candidates;
}

function findMatchesForCandidate(
  candidate: string,
  eventDetails: EventDetailsMap,
): Set<string> {
  const matches = new Set<string>();

  for (const [key, event] of eventDetails) {
    if (key === candidate || event.properties.EventShortName === candidate) {
      matches.add(event.properties.EventShortName);
    }
  }

  const lowerCandidate = candidate.toLowerCase();
  for (const [, event] of eventDetails) {
    if (event.properties.EventShortName.toLowerCase() === lowerCandidate) {
      matches.add(event.properties.EventShortName);
    }
  }

  const normalizedCandidate = normalizeEventName(candidate);
  for (const [, event] of eventDetails) {
    const shortName = event.properties.EventShortName;
    if (normalizeEventName(shortName) === normalizedCandidate) {
      matches.add(shortName);
    }
  }

  return matches;
}
