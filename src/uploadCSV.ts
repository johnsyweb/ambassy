import Papa from 'papaparse';
import { EventTeam } from './models/EventTeam';

let eventTeams: EventTeam[] = [];

export function handleFileUpload(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files) {
    console.error('No files selected');
    return;
  }

  Array.from(input.files).forEach(file => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data as any[];
        eventTeams = data.map(row => ({
          eventShortName: row['Event Short Name'],
          eventDirector: row['Event Director'],
          coEventDirector: row['Co-Event Director'] || undefined
        }));
        console.log('Parsed Event Teams:', eventTeams);
        populateEventTeamsTable(eventTeams);
      },
      error: (error) => {
        console.error('Error parsing CSV file:', error);
      }
    });
  });
}

function populateEventTeamsTable(eventTeams: EventTeam[]): void {
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

    eventNameCell.textContent = team.eventShortName;
    eventDirectorCell.textContent = team.eventDirector;
    coEventDirectorCell.textContent = team.coEventDirector || 'N/A';
  });
}