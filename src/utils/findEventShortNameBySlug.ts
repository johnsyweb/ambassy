import { EventDetailsMap } from "@models/EventDetailsMap";

export function findEventShortNameBySlug(
  slug: string,
  eventDetails: EventDetailsMap,
): string | undefined {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  const matches = new Set<string>();
  for (const [, event] of eventDetails) {
    if (event.properties.eventname.toLowerCase() === normalized) {
      matches.add(event.properties.EventShortName);
    }
  }

  if (matches.size === 1) {
    return [...matches][0];
  }

  return undefined;
}
