import { CapacityStatus } from "./CapacityStatus";

export interface EventAmbassador {
  name: string;
  events: string[];
  capacityStatus?: CapacityStatus;
}
