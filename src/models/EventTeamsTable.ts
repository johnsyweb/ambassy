import { countries } from "@models/country";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";

export interface EventTeamsTableData {
  eventShortName: string;
  eventDirectors: string;
  eventAmbassador: string;
  regionalAmbassador: string;
  eventCoordinates: string;
  eventSeries: number;
  eventCountryCode: number;
  eventCountry: string;
}

export type EventTeamsTableDataMap = Map<string, EventTeamsTableData>;

export function extractEventTeamsTableData(
  regionalAmbassadors: RegionalAmbassadorMap,
  eventAmbassadors: EventAmbassadorMap,
  eventTeams: EventTeamMap,
  eventDetails: EventDetailsMap
): EventTeamsTableDataMap {
  const data: EventTeamsTableDataMap = new Map<string, EventTeamsTableData>();

  regionalAmbassadors.forEach((ra, raName) => {
    ra.supportsEAs.forEach((ea) => {
      eventAmbassadors.get(ea)?.events.forEach((eventName) => {
        const eventTeam = eventTeams.get(eventName);
        const countryCode =
          eventDetails.get(eventName)?.properties.countrycode ?? 0;
        data.set(eventName, {
          eventShortName: eventName,
          eventDirectors: eventTeam?.eventDirectors.join(", ") ?? "N/A",
          eventAmbassador: ea,
          regionalAmbassador: raName,
          eventCoordinates:
            eventDetails.get(eventName)?.geometry?.coordinates?.join(", ") ??
            "N/A",
          eventSeries: eventDetails.get(eventName)?.properties.seriesid ?? 0,
          eventCountryCode: countryCode,
          eventCountry: countries[countryCode]?.url?.split('.').slice(-1)[0] ?? "N/A",
        });
      });
    });
  });

  return data;
}
