import { handleFileUpload } from './uploadCSV';
import { renderMap, zoomIn, zoomOut } from './mapRenderer';
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

document.getElementById('zoomInButton')?.addEventListener('click', () => {
  zoomIn(eventTeams);
});

document.getElementById('zoomOutButton')?.addEventListener('click', () => {
  zoomOut(eventTeams);
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
    const coEventDirectorCell = row.insertCell(2);
    const associatedEventLongNameCell = row.insertCell(3);
    const associatedEventLocationCell = row.insertCell(4);
    const eventCoordinatesCell = row.insertCell(5);

    eventNameCell.textContent = team.eventShortName;
    eventDirectorCell.textContent = team.eventDirector;
    coEventDirectorCell.textContent = team.coEventDirector || 'N/A';

    if (team['associatedEvent']) {
      associatedEventLongNameCell.textContent = team['associatedEvent'].properties.EventLongName;
      associatedEventLocationCell.textContent = team['associatedEvent'].properties.EventLocation;
      eventCoordinatesCell.textContent = `${team['associatedEvent'].geometry.coordinates[1]}, ${team['associatedEvent'].geometry.coordinates[0]}`;
    } else {
      associatedEventLongNameCell.textContent = 'N/A';
      associatedEventLocationCell.textContent = 'N/A';
      eventCoordinatesCell.textContent = 'N/A';
    }
  });
}
