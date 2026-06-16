import { EventDetailsMap } from "@models/EventDetailsMap";
import {
  CanonicalEventIndex,
  findMatchesForCandidate,
  getCanonicalEventIndex,
} from "@utils/canonicalEventIndex";

export function findCanonicalEventShortName(
  name: string,
  eventDetails: EventDetailsMap,
  index: CanonicalEventIndex = getCanonicalEventIndex(eventDetails),
): string | undefined {
  if (!name.trim()) {
    return undefined;
  }

  for (const candidate of buildMatchCandidates(name)) {
    const matches = findMatchesForCandidate(candidate, index);
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
