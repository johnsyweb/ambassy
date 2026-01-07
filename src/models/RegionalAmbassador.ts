import { CapacityStatus } from "./CapacityStatus";
import { Region } from "./Region";

export interface RegionalAmbassador {
  name: string;
  state: string;
  supportsEAs: string[];
  capacityStatus?: CapacityStatus;
  region?: Region;
  conflicts?: string[];
}
