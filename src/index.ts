import { handleFileUpload } from './uploadCSV';
import { renderMap } from './mapRenderer';
import { EventTeam } from './models/EventTeam';

let eventTeams: EventTeam[] = [];

// Load data from sessionStorage
const storedEventTeams = sessionStorage.getItem('eventTeams');

if (storedEventTeams) {
  eventTeams = JSON.parse(storedEventTeams);
  populateEventTeamsTable(eventTeams);
  renderMap(eventTeams);
}

document.getElementById('csvFileInput')?.addEventListener('change', handleFileUpload);
document.getElementById('uploadButton')?.addEventListener('click', () => {
  const input = document.getElementById('csvFileInput') as HTMLInputElement;
  if (input) {
    const event = new Event('change', { bubbles: true });
    Object.defineProperty(event, 'target', { value: input, enumerable: true });
    handleFileUpload(event);
    renderMap(eventTeams);
  }
});

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
