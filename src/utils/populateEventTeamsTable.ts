import { EventTeam } from '../models/EventTeam';

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
    const eventAmbassadorCell = row.insertCell(1);
    const eventDirectorsCell = row.insertCell(2);

    eventNameCell.textContent = team.eventShortName;
    eventAmbassadorCell.textContent = team.eventAmbassador;
    eventDirectorsCell.textContent = team.eventDirectors.join(', ');
  });
}