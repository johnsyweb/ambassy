import { EventTeam } from "./models/EventTeam";

export function populateEventTeamsTable(eventTeams: EventTeam[]): void {
  const tableBody = document.getElementById('eventTeamsTable')?.getElementsByTagName('tbody')[0];
  if (!tableBody) {
    console.error('Table body not found');
    return;
  }

  // Clear existing rows
  tableBody.innerHTML = '';

  // Populate table with event team data
  eventTeams.forEach(team => {
    const row = tableBody.insertRow();
    const eventNameCell = row.insertCell(0);
    const eventDirectorCell = row.insertCell(1);
    eventNameCell.textContent = team.eventShortName;
    eventDirectorCell.textContent = team.eventDirectors.join(', ');
  });
}
