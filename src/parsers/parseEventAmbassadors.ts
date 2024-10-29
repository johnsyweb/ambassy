import { EventAmbassador } from '../models/EventAmbassador';

export function parseEventAmbassadors(data): EventAmbassador[] {
  const eventAmbassadors: EventAmbassador[] = [];
  let currentEA: EventAmbassador | null = null;

  data.forEach(row => {
    const eaName = row['Event Ambassador'];
    const eventName = row['Events'];

    if (eaName) {
      if (currentEA) {
        eventAmbassadors.push(currentEA);
      }
      currentEA = {
        name: eaName,
        events: []
      };
    }

    if (currentEA && eventName) {
      currentEA.events.push(eventName);
    }
  });

  if (currentEA) {
    eventAmbassadors.push(currentEA);
  }

  return eventAmbassadors;
}