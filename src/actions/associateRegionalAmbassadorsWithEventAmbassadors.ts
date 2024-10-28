import { RegionalAmbassador } from '../models/RegionalAmbassador';
import { EventAmbassador } from '../models/EventAmbassador';

export function associateRegionalAmbassadorsWithEventAmbassadors(regionalAmbassadors: RegionalAmbassador[], eventAmbassadors: EventAmbassador[]): RegionalAmbassador[] {
  // Create a map to store the association
  const eventAmbassadorMap = new Map<string, EventAmbassador>();

  // Populate the map with event ambassadors
  eventAmbassadors.forEach(ea => {
    eventAmbassadorMap.set(ea.name, ea);
  });

  // Associate regional ambassadors with event ambassadors
  const updatedRegionalAmbassadors = regionalAmbassadors.map(ra => {
    const supportedEventAmbassadors = eventAmbassadors.filter(ea => ra.supportsEAs.includes(ea.name));
    supportedEventAmbassadors.forEach(ea => {
      ea.regionalAmbassador = ra;
    });
    return { ...ra, eventAmbassadors: supportedEventAmbassadors };
  });

  return updatedRegionalAmbassadors;
}