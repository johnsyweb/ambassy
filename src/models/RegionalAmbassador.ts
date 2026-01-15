import { CapacityStatus } from "./CapacityStatus";

export interface RegionalAmbassador {
  name: string;
  state: string;
  supportsEAs: string[];
  prospectiveEvents?: string[]; // Prospect IDs inherited through EAs
  capacityStatus?: CapacityStatus;
  conflicts?: string[];
  eventsForReallocation?: string[]; // Preserved events when EA transitions to REA
  prospectiveEventsForReallocation?: string[]; // Preserved prospective events when EA transitions to REA
}
