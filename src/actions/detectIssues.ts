import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventIssue } from "@models/EventIssue";
import { EventTeamMap } from "@models/EventTeamMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";

export function detectIssues(
  eventTeams: EventTeamMap,
  eventDetails: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap
): EventIssue[] {
  const issues: EventIssue[] = [];

  regionalAmbassadors.forEach((ra, raName) => {
    ra.supportsEAs.forEach((ea) => {
      const eventAmbassador = eventAmbassadors.get(ea);
      if (!eventAmbassador) {
        return;
      }

      eventAmbassador.events.forEach((eventName) => {
        const eventDetail = eventDetails.get(eventName);
        if (!eventDetail) {
          issues.push({
            eventShortName: eventName,
            eventAmbassador: ea,
            regionalAmbassador: raName,
            issueType: "missing_coordinates",
            status: "unresolved",
          });
        } else if (
          !eventDetail.geometry?.coordinates ||
          eventDetail.geometry.coordinates.length !== 2
        ) {
          issues.push({
            eventShortName: eventName,
            eventAmbassador: ea,
            regionalAmbassador: raName,
            issueType: "missing_details",
            status: "unresolved",
          });
        }
      });
    });
  });

  return issues.sort((a, b) => a.eventShortName.localeCompare(b.eventShortName));
}
