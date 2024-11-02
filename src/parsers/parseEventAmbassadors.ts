import { EventAmbassador } from '@models/EventAmbassador';
import { EventAmbassadorMap } from '@models/EventAmbassadorMap';

export interface EventAmbassadorRow {
  'Event Ambassador': string;
  'Events': string;
};

export function parseEventAmbassadors(data: EventAmbassadorRow[]): EventAmbassadorMap {
  const eventAmbassadorsMap: EventAmbassadorMap = new Map<string, EventAmbassador>();
  let currentEA: EventAmbassador | null = null;

  data.forEach(row => {
    const eaName = row['Event Ambassador'];
    const eventName = row['Events'];

    if (eaName) {
      if (currentEA) {
        eventAmbassadorsMap.set(currentEA.name , currentEA);
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
