import { CapacityStatus } from "./CapacityStatus";
import { Region } from "./Region";

export interface EventAmbassador {
  name: string;
  events: string[];
  capacityStatus?: CapacityStatus;
  region?: Region;
  conflicts?: string[];
}
