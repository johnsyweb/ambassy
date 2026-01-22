import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { calculateDistance } from "@utils/geography";
import { searchEvents } from "./searchEvents";

const DEFAULT_MAX_DISTANCE_KM = 50;

export function findMatchingEvents(
  prospect: ProspectiveEvent,
  eventDetails: EventDetailsMap,
  maxDistanceKm: number = DEFAULT_MAX_DISTANCE_KM,
): EventDetails[] {
  if (!prospect || !prospect.prospectEvent) {
    return [];
  }

  const matches = searchEvents(prospect.prospectEvent, eventDetails);

  if (!prospect.coordinates) {
    return matches;
  }

  const { latitude, longitude } = prospect.coordinates;

  const filtered = matches
    .map((event) => {
      const coords = event.geometry.coordinates;
      if (!coords || coords.length < 2) {
        return { event, distance: Number.POSITIVE_INFINITY };
      }
      const [lng, lat] = coords;
      const distance = calculateDistance(latitude, longitude, lat, lng);
      return { event, distance };
    })
    .filter((item) => item.distance <= maxDistanceKm)
    .sort((a, b) => {
      if (a.distance === b.distance) {
        return 0;
      }
      return a.distance < b.distance ? -1 : 1;
    });

  return filtered.map((item) => item.event);
}
