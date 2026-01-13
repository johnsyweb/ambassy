import { CapacityStatus } from "../models/CapacityStatus";
import {
  CapacityLimits,
  defaultCapacityLimits,
} from "../models/CapacityLimits";
import { EventAmbassadorMap } from "../models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";
import { loadFromStorage } from "../utils/storage";

export function checkEventAmbassadorCapacity(
  eventCount: number,
  limits: CapacityLimits,
): CapacityStatus {
  if (eventCount < limits.eventAmbassadorMin) {
    return CapacityStatus.UNDER;
  }
  if (eventCount > limits.eventAmbassadorMax) {
    return CapacityStatus.OVER;
  }
  return CapacityStatus.WITHIN;
}

export function checkRegionalAmbassadorCapacity(
  eaCount: number,
  limits: CapacityLimits,
): CapacityStatus {
  if (eaCount < limits.regionalAmbassadorMin) {
    return CapacityStatus.UNDER;
  }
  if (eaCount > limits.regionalAmbassadorMax) {
    return CapacityStatus.OVER;
  }
  return CapacityStatus.WITHIN;
}

export function loadCapacityLimits(): CapacityLimits {
  const stored = loadFromStorage<CapacityLimits>("capacityLimits");
  return stored ?? defaultCapacityLimits;
}

export function calculateAllCapacityStatuses(
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  limits: CapacityLimits,
): void {
  // Calculate capacity status for all Event Ambassadors
  eventAmbassadors.forEach((ambassador) => {
    const regularEventCount = ambassador.events.length;
    const prospectiveEventCount = ambassador.prospectiveEvents?.length || 0;
    const totalEventCount = regularEventCount + prospectiveEventCount;
    ambassador.capacityStatus = checkEventAmbassadorCapacity(
      totalEventCount,
      limits,
    );
  });

  // Calculate capacity status for all Regional Ambassadors
  regionalAmbassadors.forEach((ambassador) => {
    const eaCount = ambassador.supportsEAs.length;
    ambassador.capacityStatus = checkRegionalAmbassadorCapacity(
      eaCount,
      limits,
    );
  });
}
