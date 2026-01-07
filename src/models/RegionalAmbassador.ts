import { CapacityStatus } from "./CapacityStatus";

export interface RegionalAmbassador {
  name: string;
  state: string;
  supportsEAs: string[];
  capacityStatus?: CapacityStatus;
  conflicts?: string[];
}
