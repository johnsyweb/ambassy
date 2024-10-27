import { getEvents } from './fetchEvents';
import { renderMap } from './mapRenderer';
import { handleFileUpload, regionalAmbassadors } from './uploadCSV';
import { parkrunEvent } from './models/parkrunEvent';

var events: parkrunEvent[] = [];

getEvents().then((loadedEvents: parkrunEvent[]) => {
  if (loadedEvents.length > 0) {
    events = loadedEvents;
    renderMap(events, []);
  } else {
    console.error('Failed to fetch events');
  }
});

document.getElementById('csvFileInput')?.addEventListener('change', handleFileUpload);
document.getElementById('uploadButton')?.addEventListener('click', () => {
  const input = document.getElementById('csvFileInput') as HTMLInputElement;
  if (input) {
    const event = new Event('change', { bubbles: true });
    Object.defineProperty(event, 'target', { value: input, enumerable: true });
    handleFileUpload(event);
    renderMap(events, regionalAmbassadors);
  }
});

document.getElementById('searchButton')?.addEventListener('click', () => {
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  const searchTerm = searchInput.value.toLowerCase();
  const filteredEvents = events.filter(event =>
    event.properties.EventLongName.toLowerCase().includes(searchTerm) ||
    event.properties.EventShortName.toLowerCase().includes(searchTerm) ||
    event.properties.EventLocation.toLowerCase().includes(searchTerm)
  );
  renderMap(filteredEvents, regionalAmbassadors);
});