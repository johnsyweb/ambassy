import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import {
  eventDetailsToCoordinate,
  getEventTeamsTableDataByShortName,
} from "@models/EventDetailsMap";
import {
  getLatitude,
  getLongitude,
  isValidCoordinate,
} from "@models/Coordinate";
import {
  expandViewportBounds,
  ViewportBounds,
} from "@utils/voronoiTerritories";

export type { ViewportBounds };
export { expandViewportBounds };

export interface UnallocatedEventInViewport {
  eventName: string;
  latitude: number;
  longitude: number;
}

export function isPointInViewport(
  latitude: number,
  longitude: number,
  viewport: ViewportBounds,
): boolean {
  return (
    longitude >= viewport.minLongitude &&
    longitude <= viewport.maxLongitude &&
    latitude >= viewport.minLatitude &&
    latitude <= viewport.maxLatitude
  );
}

export function findUnallocatedEventsInViewport(
  eventDetails: EventDetailsMap,
  eventTeamsTableData: EventTeamsTableDataMap,
  viewport: ViewportBounds,
): UnallocatedEventInViewport[] {
  const expandedViewport = expandViewportBounds(viewport);
  const unallocatedEvents: UnallocatedEventInViewport[] = [];

  eventDetails.forEach((event, eventName) => {
    if (getEventTeamsTableDataByShortName(eventTeamsTableData, eventName)) {
      return;
    }

    try {
      const coordinate = eventDetailsToCoordinate(event);
      if (!isValidCoordinate(coordinate)) {
        return;
      }

      const latitude = getLatitude(coordinate);
      const longitude = getLongitude(coordinate);

      if (!isPointInViewport(latitude, longitude, expandedViewport)) {
        return;
      }

      unallocatedEvents.push({ eventName, latitude, longitude });
    } catch {
      return;
    }
  });

  return unallocatedEvents.sort((left, right) =>
    left.eventName.localeCompare(right.eventName),
  );
}
