import { RegionalAmbassador } from '../models/RegionalAmbassador';
import { EventAmbassador } from '../models/EventAmbassador';

export function associateRegionalAmbassadorsWithEventAmbassadors(regionalAmbassadors: RegionalAmbassador[], eventAmbassadors: EventAmbassador[]): RegionalAmbassador[] {
  return regionalAmbassadors.map(ra => ({
    ...ra,
    eventAmbassadors: eventAmbassadors.filter(ea => ra.supportsEAs.includes(ea.name))
  }));
}