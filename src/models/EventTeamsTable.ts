import { getCountriesSync } from "@models/country";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventDetailsMap, eventDetailsToCoordinate } from "@models/EventDetailsMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventTeamsTableData, EventTeamsTableDataMap } from "./EventTeamsTableData";
import { formatCoordinate } from "./Coordinate";
import { extractCountryCodeFromUrl } from "./CountryCode";

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
        const eventCoordinates = eventDetails 
          ? formatCoordinate(eventDetailsToCoordinate(eventDetails))
          : "N/A";
        
        // Extract country code from URL, falling back to "N/A" if invalid
        const countryUrl = getCountriesSync()[countryCode.toString()]?.url;
        const eventCountry = countryUrl 
          ? extractCountryCodeFromUrl(countryUrl) ?? "N/A"
          : "N/A";
        
        data.set(eventName, {
          eventShortName: eventName,
          eventDirectors: eventTeam?.eventDirectors.join(", ") ?? "N/A",
          eventAmbassador: ea,
          regionalAmbassador: raName,
          eventCoordinates,
          eventSeries: eventDetails?.properties.seriesid ?? 0,
          eventCountryCode: countryCode,
          eventCountry,
        });
      });
    });
  });

  return data;
}
