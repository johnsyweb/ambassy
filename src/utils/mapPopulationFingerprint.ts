import {
  EventDetailsMap,
  eventDetailsToCoordinate,
} from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import {
  getLatitude,
  getLongitude,
  isValidCoordinate,
} from "@models/Coordinate";
import { ProspectiveEvent } from "@models/ProspectiveEvent";

export type MapPopulationInputs = {
  eventTeamsTableData: EventTeamsTableDataMap;
  eventDetails: EventDetailsMap;
  prospectiveEvents?: ProspectiveEvent[];
};

function formatDegrees(value: number): string {
  return value.toFixed(6);
}

function appendAllocationParts(
  parts: string[],
  eventTeamsTableData: EventTeamsTableDataMap,
): void {
  const keys = [...eventTeamsTableData.keys()].sort();
  for (const eventShortName of keys) {
    const row = eventTeamsTableData.get(eventShortName)!;
    parts.push(
      [
        "a",
        eventShortName,
        row.eventAmbassador,
        row.regionalAmbassador,
        row.eventDirectors,
      ].join(":"),
    );
  }
}

function appendCatalogueCoordinateParts(
  parts: string[],
  eventDetails: EventDetailsMap,
): void {
  const keys = [...eventDetails.keys()].sort();
  for (const eventShortName of keys) {
    const event = eventDetails.get(eventShortName);
    if (!event?.geometry?.coordinates) {
      continue;
    }

    try {
      const coordinate = eventDetailsToCoordinate(event);
      if (!isValidCoordinate(coordinate)) {
        continue;
      }
      parts.push(
        [
          "e",
          eventShortName,
          formatDegrees(getLongitude(coordinate)),
          formatDegrees(getLatitude(coordinate)),
        ].join(":"),
      );
    } catch {
      // Skip events without usable coordinates.
    }
  }
}

function appendProspectParts(
  parts: string[],
  prospectiveEvents: ProspectiveEvent[],
): void {
  const sorted = [...prospectiveEvents].sort((left, right) =>
    left.id.localeCompare(right.id),
  );

  for (const prospect of sorted) {
    const longitude = prospect.coordinates
      ? formatDegrees(getLongitude(prospect.coordinates))
      : "";
    const latitude = prospect.coordinates
      ? formatDegrees(getLatitude(prospect.coordinates))
      : "";

    parts.push(
      [
        "p",
        prospect.id,
        prospect.geocodingStatus,
        prospect.eventAmbassador ?? "",
        longitude,
        latitude,
      ].join(":"),
    );
  }
}

/**
 * Stable fingerprint of map population inputs: allocations, catalogue
 * coordinates (Voronoi constraining sites), and prospective events.
 */
export function computeMapPopulationFingerprint(
  inputs: MapPopulationInputs,
): string {
  const parts: string[] = [];
  appendAllocationParts(parts, inputs.eventTeamsTableData);
  appendCatalogueCoordinateParts(parts, inputs.eventDetails);
  appendProspectParts(parts, inputs.prospectiveEvents ?? []);
  return parts.join("|");
}
