import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import {
  eventDetailsToCoordinate,
  getEventTeamsTableDataByShortName,
} from "@models/EventDetailsMap";
import { getLatitude, getLongitude, isValidCoordinate } from "@models/Coordinate";
import { ViewportBounds } from "@utils/voronoiTerritories";

export interface UnallocatedEventInViewport {
  eventName: string;
  latitude: number;
  longitude: number;
}

export function expandViewportBounds(
  viewport: ViewportBounds,
  bufferRatio = 0.1,
): ViewportBounds {
  const longitudeSpan = viewport.maxLongitude - viewport.minLongitude;
  const latitudeSpan = viewport.maxLatitude - viewport.minLatitude;
  const longitudeBuffer = longitudeSpan * bufferRatio;
  const latitudeBuffer = latitudeSpan * bufferRatio;

  return {
    minLongitude: viewport.minLongitude - longitudeBuffer,
    maxLongitude: viewport.maxLongitude + longitudeBuffer,
    minLatitude: viewport.minLatitude - latitudeBuffer,
    maxLatitude: viewport.maxLatitude + latitudeBuffer,
  };
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
    if (
      getEventTeamsTableDataByShortName(eventTeamsTableData, eventName)
    ) {
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
