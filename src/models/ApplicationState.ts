import { EventAmbassador } from "./EventAmbassador";
import { EventTeam } from "./EventTeam";
import { RegionalAmbassador } from "./RegionalAmbassador";
import { LogEntry } from "./LogEntry";
import { CapacityLimits } from "./CapacityLimits";
import { EventDetails } from "./EventDetails";
import { ProspectiveEvent } from "./ProspectiveEvent";
import { AmbassadorFinishHistoryMap } from "./AmbassadorFinishHistory";

export const CURRENT_APPLICATION_STATE_VERSION = "2.0.0";

export const SUPPORTED_APPLICATION_STATE_VERSIONS = [
  "1.0.0",
  CURRENT_APPLICATION_STATE_VERSION,
] as const;

export type SupportedApplicationStateVersion =
  (typeof SUPPORTED_APPLICATION_STATE_VERSIONS)[number];

export interface ApplicationStateData {
  eventAmbassadors: Array<[string, EventAmbassador]>;
  eventTeams: Array<[string, EventTeam]>;
  regionalAmbassadors: Array<[string, RegionalAmbassador]>;
  changesLog: LogEntry[];
  capacityLimits?: CapacityLimits;
  resolvedEventDetails?: Array<[string, EventDetails]>;
  prospectiveEvents?: ProspectiveEvent[];
  ambassadorFinishHistories?: AmbassadorFinishHistoryMap;
}

export interface ApplicationState {
  version: SupportedApplicationStateVersion | string;
  exportedAt: string;
  data: ApplicationStateData;
}
