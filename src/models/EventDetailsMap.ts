import { EventDetails, eventDetailsToCoordinate, coordinateToEventDetailsGeometry } from "@models/EventDetails";
import { normalizeEventName } from "@utils/fuzzyMatch";
import { EventTeamsTableData, EventTeamsTableDataMap } from "./EventTeamsTableData";

export type EventDetailsMap = Map<string, EventDetails>;

// Re-export coordinate conversion functions for convenience
export { eventDetailsToCoordinate, coordinateToEventDetailsGeometry };

export function getEventDetailsByShortName(
  eventDetails: EventDetailsMap,
  shortName: string,
): EventDetails | undefined {
  const directMatch = eventDetails.get(shortName);
  if (directMatch) {
    return directMatch;
  }

  const normalizedShortName = normalizeEventName(shortName);
  for (const [key, event] of eventDetails) {
    if (normalizeEventName(key) === normalizedShortName) {
      return event;
    }
  }

  return undefined;
}

export function getEventTeamsTableDataByShortName(
  eventTeamsTableData: EventTeamsTableDataMap,
  shortName: string,
): EventTeamsTableData | undefined {
  const directMatch = eventTeamsTableData.get(shortName);
  if (directMatch) {
    return directMatch;
  }

  const normalizedShortName = normalizeEventName(shortName);
  for (const [key, data] of eventTeamsTableData) {
    if (normalizeEventName(key) === normalizedShortName) {
      return data;
    }
  }

  return undefined;
}
