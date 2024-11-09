import { populateChangesLogTable } from "@actions/populateChangesLogTable";
import { populateEventTeamsTable } from "@actions/populateEventTeamsTable";
import { populateMap } from "@actions/populateMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { LogEntry } from "@models/LogEntry";

export function refreshUI(eventDetails: EventDetailsMap, eventTeamsTableData: EventTeamsTableDataMap, log: LogEntry[]) {
  if (!eventDetails || !eventTeamsTableData) {
    console.error("Event details are not available");
    return;
  }
  populateEventTeamsTable(eventTeamsTableData, eventDetails, log);
  populateMap(eventTeamsTableData, eventDetails);
  populateChangesLogTable(log);
}
