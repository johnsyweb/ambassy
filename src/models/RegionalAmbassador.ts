import { CapacityStatus } from "./CapacityStatus";

export interface RegionalAmbassador {
  name: string;
  state: string;
  supportsEAs: string[];
  prospectiveEvents?: string[]; // Prospect IDs inherited through EAs
  capacityStatus?: CapacityStatus;
  conflicts?: string[];
}
