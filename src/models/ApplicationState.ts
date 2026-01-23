import { EventAmbassador } from "./EventAmbassador";
import { EventTeam } from "./EventTeam";
import { RegionalAmbassador } from "./RegionalAmbassador";
import { LogEntry } from "./LogEntry";
import { CapacityLimits } from "./CapacityLimits";
import { EventDetails } from "./EventDetails";

export interface ApplicationStateData {
  eventAmbassadors: Array<[string, EventAmbassador]>;
  eventTeams: Array<[string, EventTeam]>;
  regionalAmbassadors: Array<[string, RegionalAmbassador]>;
  changesLog: LogEntry[];
  capacityLimits?: CapacityLimits;
  resolvedEventDetails?: Array<[string, EventDetails]>;
}

export interface ApplicationState {
  version: string;
  exportedAt: string;
  data: ApplicationStateData;
}

