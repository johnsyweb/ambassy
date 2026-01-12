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

  populateEventTeamsTable(eventTeamsTableData, eventDetails, log, eventAmbassadorsToUse, regionalAmbassadorsToUse);
  populateMap(eventTeamsTableData, eventDetails, prospectiveEvents);
  populateAmbassadorsTable(eventAmbassadorsToUse, regionalAmbassadorsToUse, eventTeamsTableData);
  populateProspectsTable(prospectsList, eventAmbassadorsToUse, regionalAmbassadorsToUse);
  populateChangesLogTable(log);
}
