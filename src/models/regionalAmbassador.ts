import { EventAmbassador } from "./EventAmbassador";

export interface RegionalAmbassador {
  name: string;
  state: string;
  supportsEAs: string[];
  eventAmbassadors?: EventAmbassador[];
}
