import { EventAmbassador } from "./EventAmbassador";
import { EventTeam } from "./EventTeam";
import { RegionalAmbassador } from "./RegionalAmbassador";
import { LogEntry } from "./LogEntry";
import { CapacityLimits } from "./CapacityLimits";

export interface ApplicationStateData {
  eventAmbassadors: Array<[string, EventAmbassador]>;
  eventTeams: Array<[string, EventTeam]>;
  regionalAmbassadors: Array<[string, RegionalAmbassador]>;
  changesLog: LogEntry[];
  capacityLimits?: CapacityLimits;
}

export interface ApplicationState {
  version: string;
  exportedAt: string;
  data: ApplicationStateData;
}

