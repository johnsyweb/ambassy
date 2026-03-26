import { EventAmbassador } from '@models/EventAmbassador';
import { EventAmbassadorMap } from '@models/EventAmbassadorMap';
import { csvStringCell } from '@utils/csvField';

/** One row from the Event Ambassadors CSV; extra columns are ignored after pick. */
export interface EventAmbassadorRow {
  "Event Ambassador": string;
  Events: string;
  [key: string]: string | undefined;
}

function pickEventAmbassadorRow(raw: EventAmbassadorRow): EventAmbassadorRow {
  return {
    "Event Ambassador": csvStringCell(raw["Event Ambassador"]),
    Events: csvStringCell(raw["Events"]),
  };
}

export function parseEventAmbassadors(
  data: ReadonlyArray<EventAmbassadorRow>,
): EventAmbassadorMap {
  const eventAmbassadorsMap: EventAmbassadorMap = new Map<string, EventAmbassador>();
  let currentEA: EventAmbassador | null = null;

  data.forEach((raw) => {
    const row = pickEventAmbassadorRow(raw);
    const eaName = row["Event Ambassador"];
    const eventName = row["Events"];

    if (eaName) {
      if (currentEA) {
        eventAmbassadorsMap.set(currentEA.name, currentEA);
      }
      currentEA = {
        name: eaName,
        events: [],
      };
    }

    if (currentEA && eventName) {
      currentEA.events.push(eventName);
    }
  });

  if (currentEA) {
    eventAmbassadorsMap.set(currentEA['name'], currentEA);
  }

  return eventAmbassadorsMap;
}
