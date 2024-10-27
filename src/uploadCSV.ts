import Papa from 'papaparse';
import { EventTeam } from './models/EventTeam';
import { RegionalAmbassador } from './models/regionalAmbassador';
import { EventAmbassador } from './models/EventAmbassador';
import { ParkRunEvent } from './models/parkrunEvent';

let eventTeams: EventTeam[] = [];
let regionalAmbassadors: RegionalAmbassador[] = [];
let eventAmbassadors: EventAmbassador[] = [];
let parkRunEvents: ParkRunEvent[] = [];

export async function handleFileUpload(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  if (!input.files) {
    console.error('No files selected');
    return;
  }

  Array.from(input.files).forEach(file => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        if (file.name.includes('Event Teams')) {
          parseEventTeams(data);
          console.log('Parsed Event Teams:', eventTeams);
          populateEventTeamsTable(eventTeams);
        } else if (file.name.includes('Regional Ambassadors')) {
          parseRegionalAmbassadors(data);
          console.log('Parsed Regional Ambassadors:', regionalAmbassadors);
        } else if (file.name.includes('Event Ambassadors')) {
          parseEventAmbassadors(data);
          console.log('Parsed Event Ambassadors:', eventAmbassadors);
        }

        // Persist data in sessionStorage
        sessionStorage.setItem('eventTeams', JSON.stringify(eventTeams));
        sessionStorage.setItem('regionalAmbassadors', JSON.stringify(regionalAmbassadors));
        sessionStorage.setItem('eventAmbassadors', JSON.stringify(eventAmbassadors));
      },
      error: (error) => {
        console.error('Error parsing CSV file:', error);
      }
    });
  });
}

function parseEventTeams(data: any[]): void {
  let currentEventTeam: EventTeam | null = null;

  data.forEach(row => {
    const eventShortName = row['Event'];
    const eventAmbassador = row['Event Ambassador'];
    const eventDirector = row['Event Director/s'];

    if (eventShortName) {
      if (currentEventTeam) {
        eventTeams.push(currentEventTeam);
      }
      currentEventTeam = {
        eventShortName,
        eventAmbassador,
        eventDirectors: eventDirector ? [eventDirector] : [],
        };
    } else if (currentEventTeam && eventDirector) {
      currentEventTeam.eventDirectors.push(eventDirector);
    }
  });

  if (currentEventTeam) {
    eventTeams.push(currentEventTeam);
  }
}

function parseRegionalAmbassadors(data: any[]): void {
  let currentRA: RegionalAmbassador | null = null;

  data.forEach(row => {
    const raName = row['RA Name'];
    const raState = row['RA State'];
    const eaName = row['EA Name'];

    if (raName) {
      if (currentRA) {
        regionalAmbassadors.push(currentRA);
      }
      currentRA = {
        name: raName,
        state: raState,
        supportsEAs: []
      };
    }

    if (currentRA && eaName) {
      currentRA.supportsEAs.push(eaName);
    }
  });

  if (currentRA) {
    regionalAmbassadors.push(currentRA);
  }
}

function parseEventAmbassadors(data: any[]): void {
  let currentEA: EventAmbassador | null = null;

  data.forEach(row => {
    const eaName = row['Event Ambassador'];
    const eventName = row['Events'];

    if (eaName) {
      if (currentEA) {
        eventAmbassadors.push(currentEA);
      }
      currentEA = {
        name: eaName,
        events: []
      };
    }

    if (currentEA && eventName) {
      currentEA.events.push(eventName);
    }
  });

  if (currentEA) {
    eventAmbassadors.push(currentEA);
  }
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
    const eventAmbassadorCell = row.insertCell(1);
    const eventDirectorsCell = row.insertCell(2);

    eventNameCell.textContent = team.eventShortName;
    eventAmbassadorCell.textContent = team.eventAmbassador;
    eventDirectorsCell.textContent = team.eventDirectors.join(', ');
  });
}
