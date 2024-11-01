import { EventAmbassadorMap } from "../models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";
import { EventTeamMap } from "../models/EventTeamMap";

export function populateEventTeamsTable(
  regionalAmbassadors: RegionalAmbassadorMap,
  eventAmbassadors: EventAmbassadorMap,
  eventTeams: EventTeamMap
): void {
  const tableBody = document
    .getElementById("eventTeamsTable")
    ?.getElementsByTagName("tbody")[0];
  if (!tableBody) {
    console.error("Table body not found");
    return;
  }

  tableBody.innerHTML = "";

  regionalAmbassadors.forEach((ra, raName) => {
    ra.supportsEAs.forEach((ea) => {
      eventAmbassadors.get(ea)?.events.forEach((eventName) => {
        const eventTeam = eventTeams.get(eventName);
        const row = tableBody.insertRow();
        const raNameCell = row.insertCell(0);
        const eaNameCell = row.insertCell(1);
        const eventNameCell = row.insertCell(2);
        const eventDirectorsCell = row.insertCell(3);
        const eventCoordinatesCell = row.insertCell(4);

        raNameCell.textContent = raName;
        eaNameCell.textContent = ea;
        eventNameCell.textContent = eventName;
        eventDirectorsCell.textContent =
          eventTeam?.eventDirectors.join(", ") ?? "N/A";
        // eventCoordinatesCell.textContent = team.associatedEvent
        //   ? `${team.associatedEvent.geometry.coordinates[1]}, ${team.associatedEvent.geometry.coordinates[0]}`
        //   : 'N/A';
      });
    });
  });
}
