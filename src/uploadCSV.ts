import Papa from 'papaparse';
import { EventTeam } from './models/EventTeam';

let eventTeams: EventTeam[] = [];

export function handleFileUpload(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files) {
    console.error('No files selected');
    return;
  }

  const file = input.files[0];
  if (!file) {
    console.error('No file found');
    return;
  }

  Papa.parse(file, {
    header: true,
    complete: (results) => {
      const data = results.data as any[];
      eventTeams = data.map(row => ({
        eventShortName: row['Event Short Name'],
        eventDirector: row['Event Director'],
        coEventDirector: row['Co-Event Director'] || undefined
      }));
      console.debug('Parsed Event Teams:', eventTeams);
      populateEventTeamsTable(eventTeams);
    },
    error: (error) => {
      console.error('Error parsing CSV file:', error);
    }
  });
}

function populateEventTeamsTable(eventTeams: EventTeam[]): void {
  const tableBody = document.querySelector('#eventTeamsTable tbody') as HTMLTableSectionElement;
  if (!tableBody) {
    console.error('Table body not found');
    return;
  }

  tableBody.innerHTML = ''; // Clear existing rows

  eventTeams.forEach(({ eventShortName, eventDirector, coEventDirector }) => {
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = eventShortName;
    row.insertCell(1).textContent = eventDirector;
    row.insertCell(2).textContent = coEventDirector || 'N/A';
  });
}
