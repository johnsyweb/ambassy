import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate that a reallocation can be performed.
 * Returns validation result with optional error message.
 */
export function validateReallocation(
  eventShortName: string,
  newAmbassador: string,
  eventAmbassadors: EventAmbassadorMap,
  eventTeamsTableData: EventTeamsTableDataMap
): ValidationResult {
  const eventData = eventTeamsTableData.get(eventShortName);

  if (!eventData) {
    return {
      valid: false,
      error: "Event not found in table data",
    };
  }

  if (!eventAmbassadors.has(newAmbassador)) {
    return {
      valid: false,
      error: "Recipient ambassador not found",
    };
  }

  const currentAmbassador = eventData.eventAmbassador;

  if (!currentAmbassador || currentAmbassador.trim() === "") {
    return {
      valid: false,
      error: "Event is not currently assigned to any ambassador",
    };
  }

  if (currentAmbassador === newAmbassador) {
    return {
      valid: false,
      error: "Event is already assigned to this ambassador",
    };
  }

  return {
    valid: true,
  };
}
