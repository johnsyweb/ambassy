import { EventAmbassadorMap } from "./EventAmbassadorMap";
import { EventDetailsMap } from "./EventDetailsMap";
import { EventTeamMap } from "./EventTeamMap";
import { RegionalAmbassadorMap } from "./RegionalAmbassadorMap";

export interface EventTeamsTableData {
  eventShortName: string;
  eventDirectors: string;
  eventAmbassador: string;
  regionalAmbassador: string;
  eventCoordinates: string;
  eventSeries: number;
  eventCountry: number;
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
        data.set(eventName, {
          eventShortName: eventName,
          eventDirectors: eventTeam?.eventDirectors.join(", ") ?? "N/A",
          eventAmbassador: ea,
          regionalAmbassador: raName,
          eventCoordinates:
            eventDetails.get(eventName)?.geometry?.coordinates?.join(", ") ??
            "N/A",
          eventSeries: eventDetails.get(eventName)?.properties.seriesid ?? 0,
          eventCountry:
            eventDetails.get(eventName)?.properties.countrycode ?? 0,
        });
      });
    });
  });

  return data;
}
