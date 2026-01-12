import { countries } from "@models/country";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventTeamsTableData, EventTeamsTableDataMap } from "./EventTeamsTableData";

export function extractEventTeamsTableData(
  regionalAmbassadors: RegionalAmbassadorMap,
  eventAmbassadors: EventAmbassadorMap,
  eventTeams: EventTeamMap,
  eventDetailsMap: EventDetailsMap
): EventTeamsTableDataMap {
  const data: EventTeamsTableDataMap = new Map<string, EventTeamsTableData>();

  regionalAmbassadors.forEach((ra, raName) => {
    ra.supportsEAs.forEach((ea) => {
      eventAmbassadors.get(ea)?.events.forEach((eventName) => {
        const eventDetails = eventDetailsMap.get(eventName);
        const eventTeam = eventTeams.get(eventName);
        const countryCode =
          eventDetails?.properties.countrycode ?? 0;
        data.set(eventName, {
          eventShortName: eventName,
          eventDirectors: eventTeam?.eventDirectors.join(", ") ?? "N/A",
          eventAmbassador: ea,
          regionalAmbassador: raName,
          eventCoordinates:
            eventDetails?.geometry?.coordinates?.join(", ") ??
            "N/A",
          eventSeries: eventDetails?.properties.seriesid ?? 0,
          eventCountryCode: countryCode,
          eventCountry: countries[countryCode.toString()]?.url?.split('.').slice(-1)[0] ?? "N/A",
        });
      });
    });
  });

  return data;
}
