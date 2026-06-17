import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { searchEvents } from "@actions/searchEvents";
import type { PlaceSearchResult } from "@utils/geocoding";
import { searchProspectiveEvents } from "@utils/searchProspectiveEvents";
import {
  eventTeamRowMatchesAmbassadorNameFilter,
  isAmbassadorNameFilterActive,
  prospectRowMatchesAmbassadorNameFilter,
  regionalAmbassadorForEventAmbassador,
} from "@utils/ambassadorNameFilter";

export type TerritoryMapSearchLiveEventSuggestion = {
  kind: "live-event";
  eventShortName: string;
  label: string;
  isUnallocated: boolean;
  hiddenByAmbassadorFilter: boolean;
};

export type TerritoryMapSearchProspectSuggestion = {
  kind: "prospect";
  prospectId: string;
  label: string;
  hasLocation: boolean;
  hiddenByAmbassadorFilter: boolean;
};

export type TerritoryMapSearchPlaceSuggestion = {
  kind: "place";
  label: string;
  latitude: number;
  longitude: number;
};

export type TerritoryMapSearchLocalSuggestions = {
  liveEvents: TerritoryMapSearchLiveEventSuggestion[];
  prospectiveEvents: TerritoryMapSearchProspectSuggestion[];
};

export function buildLocalTerritoryMapSearchSuggestions(input: {
  query: string;
  eventDetails: EventDetailsMap;
  eventTeamsTableData: EventTeamsTableDataMap;
  prospects: ProspectiveEvent[];
  eventAmbassadors: EventAmbassadorMap;
  ambassadorFilter: string;
}): TerritoryMapSearchLocalSuggestions {
  const liveEvents = searchEvents(input.query, input.eventDetails).map(
    (event) => {
      const eventShortName = event.properties.EventShortName;
      const allocation = input.eventTeamsTableData.get(eventShortName);
      const isUnallocated = !allocation;
      const hiddenByAmbassadorFilter = isUnallocated
        ? isAmbassadorNameFilterActive(input.ambassadorFilter)
        : !eventTeamRowMatchesAmbassadorNameFilter(
            allocation!,
            input.ambassadorFilter,
          );

      return {
        kind: "live-event" as const,
        eventShortName,
        label: event.properties.EventLongName,
        isUnallocated,
        hiddenByAmbassadorFilter,
      };
    },
  );

  const prospectiveEvents = searchProspectiveEvents(
    input.query,
    input.prospects,
  ).map((prospect) => ({
    kind: "prospect" as const,
    prospectId: prospect.id,
    label: prospect.prospectEvent,
    hasLocation:
      prospect.geocodingStatus === "success" && prospect.coordinates !== null,
    hiddenByAmbassadorFilter: !prospectRowMatchesAmbassadorNameFilter(
      prospect.eventAmbassador,
      regionalAmbassadorForEventAmbassador(
        prospect.eventAmbassador,
        input.eventAmbassadors,
      ),
      input.ambassadorFilter,
    ),
  }));

  return { liveEvents, prospectiveEvents };
}

export function toPlaceSuggestion(
  place: PlaceSearchResult,
): TerritoryMapSearchPlaceSuggestion {
  return {
    kind: "place",
    label: place.label,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

export const TERRITORY_MAP_SEARCH_FILTER_HIDDEN_SUFFIX =
  "Hidden by ambassador name filter";
export const TERRITORY_MAP_SEARCH_UNALLOCATED_SUFFIX = "Unallocated";
export const TERRITORY_MAP_SEARCH_NO_LOCATION_SUFFIX = "No location";

export const TERRITORY_MAP_SEARCH_NO_MAP_LOCATION_STATUS =
  "No map location — geocode from the Prospects table.";
