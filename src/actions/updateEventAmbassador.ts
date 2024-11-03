import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { LogEntry } from "@models/LogEntry";

export function updateEventAmbassador(
  eventTeamsTableDataMap: EventTeamsTableDataMap,
  eventShortName: string,
  newEventAmbassador: string,
  log: LogEntry[]
): EventTeamsTableDataMap {
  const eventTeam = eventTeamsTableDataMap.get(eventShortName);
  if (eventTeam) {
    const oldEventAmbassador = eventTeam.eventAmbassador;
    eventTeam.eventAmbassador = newEventAmbassador;
    eventTeamsTableDataMap.set(eventShortName, eventTeam);

    log.push({
      type: 'update event ambassador',
      event: eventShortName,
      oldValue: oldEventAmbassador,
      newValue: newEventAmbassador,
      timestamp: Date.now()
    });
  }
  return eventTeamsTableDataMap;
}
