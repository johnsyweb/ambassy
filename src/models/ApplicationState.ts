import { EventAmbassador } from "./EventAmbassador";
import { EventTeam } from "./EventTeam";
import { RegionalAmbassador } from "./RegionalAmbassador";
import { LogEntry } from "./LogEntry";

export interface ApplicationStateData {
  eventAmbassadors: Array<[string, EventAmbassador]>;
  eventTeams: Array<[string, EventTeam]>;
  regionalAmbassadors: Array<[string, RegionalAmbassador]>;
  changesLog: LogEntry[];
}

export interface ApplicationState {
  version: string;
  exportedAt: string;
  data: ApplicationStateData;
}

