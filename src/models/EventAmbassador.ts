import { CapacityStatus } from "./CapacityStatus";

export interface EventAmbassador {
  name: string;
  events: string[];
  prospectiveEvents?: string[]; // IDs of prospective events assigned to this EA
  capacityStatus?: CapacityStatus;
  conflicts?: string[];
  regionalAmbassador?: string; // RA this EA reports to
}
