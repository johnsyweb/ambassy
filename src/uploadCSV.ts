import Papa from 'papaparse';
import { EventTeam } from './models/EventTeam';
import { ParkRunEvent } from './models/parkrunEvent';
import { getEvents } from './fetchEvents';
import { populateEventTeamsTable } from './index';


let eventTeams: EventTeam[] = [];
let events: ParkRunEvent[] = [];

export async function handleFileUpload(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  if (!input.files) {
    console.error('No files selected');
    return;
  }

  // Fetch events
  events = await getEvents();

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
        associateEventTeamsWithEvents(eventTeams, events);
        populateEventTeamsTable(eventTeams);

        // Persist data in sessionStorage
        sessionStorage.setItem('eventTeams', JSON.stringify(eventTeams));
        sessionStorage.setItem('events', JSON.stringify(events));
      },
      error: (error) => {
        console.error('Error parsing CSV file:', error);
      }
    });
  });
}

function associateEventTeamsWithEvents(eventTeams: EventTeam[], events: ParkRunEvent[]): void {
  eventTeams.forEach(team => {
    const associatedEvent = events.find(event => event.properties.EventShortName === team.eventShortName);
    if (associatedEvent) {
      team['associatedEvent'] = associatedEvent;
    } else {
      console.warn(`No matching event found for team: ${team.eventShortName}`);
    }
  });
}
