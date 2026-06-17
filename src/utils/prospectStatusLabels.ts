import { ProspectiveEvent } from "@models/ProspectiveEvent";

export function formatProspectGeocodingStatusLabel(
  status: ProspectiveEvent["geocodingStatus"],
): string {
  switch (status) {
    case "pending":
      return "Pending geocoding";
    case "success":
      return "Location found";
    case "failed":
      return "Location not found";
    case "manual":
      return "Manual coordinates";
    default:
      return status;
  }
}

export function formatProspectAmbassadorAssignmentStatusLabel(
  status: ProspectiveEvent["ambassadorMatchStatus"],
): string {
  switch (status) {
    case "pending":
      return "Event Ambassador not yet matched (import)";
    case "matched":
      return "Event Ambassador assigned";
    case "unmatched":
      return "No Event Ambassador assigned";
    default:
      return status;
  }
}
