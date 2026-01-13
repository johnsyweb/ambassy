import { populateChangesLogTable } from "@actions/populateChangesLogTable";
import { populateEventTeamsTable } from "@actions/populateEventTeamsTable";
import { populateMap } from "@actions/populateMap";
import { populateAmbassadorsTable } from "@actions/populateAmbassadorsTable";
import { populateProspectsTable } from "@actions/populateProspectsTable";
import { loadProspectiveEvents } from "@actions/persistProspectiveEvents";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventAmbassador } from "@models/EventAmbassador";
import { RegionalAmbassador } from "@models/RegionalAmbassador";
import { LogEntry } from "@models/LogEntry";
import { loadFromStorage } from "@utils/storage";
import { getCountriesSync } from "@models/country";

export function refreshUI(
  eventDetails: EventDetailsMap,
  eventTeamsTableData: EventTeamsTableDataMap,
  log: LogEntry[],
  eventAmbassadors?: EventAmbassadorMap,
  regionalAmbassadors?: RegionalAmbassadorMap
) {
  if (!eventDetails || !eventTeamsTableData) {
    console.error("Event details are not available");
    return;
  }

  // Load ambassadors from storage if not provided
  const eventAmbassadorsToUse =
    eventAmbassadors ??
    (() => {
      const stored = loadFromStorage<Array<[string, EventAmbassador]>>("eventAmbassadors");
      return stored ? new Map<string, EventAmbassador>(stored) : new Map<string, EventAmbassador>();
    })();

  const regionalAmbassadorsToUse =
    regionalAmbassadors ??
    (() => {
      const stored = loadFromStorage<Array<[string, RegionalAmbassador]>>("regionalAmbassadors");
      return stored ? new Map<string, RegionalAmbassador>(stored) : new Map<string, RegionalAmbassador>();
    })();

  const prospectiveEvents = loadProspectiveEvents();
  const prospectsList = new ProspectiveEventList(prospectiveEvents);

  populateEventTeamsTable(eventTeamsTableData);
  populateMap(eventTeamsTableData, eventDetails, eventAmbassadorsToUse, regionalAmbassadorsToUse, prospectiveEvents);
  
  // Get countries synchronously (should already be cached)
  const countries = getCountriesSync();
  
  populateAmbassadorsTable(eventAmbassadorsToUse, regionalAmbassadorsToUse, eventTeamsTableData, eventDetails, countries);
  populateProspectsTable(prospectsList, eventAmbassadorsToUse, regionalAmbassadorsToUse, log, eventDetails);
  populateChangesLogTable(log);
}
