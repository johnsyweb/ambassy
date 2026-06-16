import { EventDetailsMap } from "@models/EventDetailsMap";
import { normalizeEventName } from "@utils/fuzzyMatch";

export function findCanonicalEventShortName(
  name: string,
  eventDetails: EventDetailsMap,
): string | undefined {
  if (!name.trim()) {
    return undefined;
  }

  for (const [key, event] of eventDetails) {
    if (key === name || event.properties.EventShortName === name) {
      return event.properties.EventShortName;
    }
  }

  const lowerName = name.toLowerCase();
  for (const [, event] of eventDetails) {
    if (event.properties.EventShortName.toLowerCase() === lowerName) {
      return event.properties.EventShortName;
    }
  }

  const normalizedQuery = normalizeEventName(name);
  const matches = new Set<string>();

  for (const [, event] of eventDetails) {
    const shortName = event.properties.EventShortName;
    if (normalizeEventName(shortName) === normalizedQuery) {
      matches.add(shortName);
    }
  }

  if (matches.size === 1) {
    return [...matches][0];
  }

  return undefined;
}
