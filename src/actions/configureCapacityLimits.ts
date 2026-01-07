import { CapacityLimits } from "../models/CapacityLimits";
import { saveToStorage } from "../utils/storage";

export function validateCapacityLimits(limits: CapacityLimits): boolean {
  if (
    !Number.isInteger(limits.eventAmbassadorMin) ||
    !Number.isInteger(limits.eventAmbassadorMax) ||
    !Number.isInteger(limits.regionalAmbassadorMin) ||
    !Number.isInteger(limits.regionalAmbassadorMax)
  ) {
    return false;
  }

  if (
    limits.eventAmbassadorMin < 0 ||
    limits.eventAmbassadorMax < 0 ||
    limits.regionalAmbassadorMin < 0 ||
    limits.regionalAmbassadorMax < 0
  ) {
    return false;
  }

  if (limits.eventAmbassadorMin > limits.eventAmbassadorMax) {
    return false;
  }

  if (limits.regionalAmbassadorMin > limits.regionalAmbassadorMax) {
    return false;
  }

  return true;
}

export function saveCapacityLimits(limits: CapacityLimits): void {
  if (!validateCapacityLimits(limits)) {
    throw new Error("Invalid capacity limits: minimum must be less than or equal to maximum, and all values must be non-negative integers");
  }
  saveToStorage("capacityLimits", limits);
}

