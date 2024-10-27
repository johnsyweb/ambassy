import { getEvents } from './fetchEvents';
import { renderMap } from './mapRenderer';
import { handleFileUpload } from './uploadCSV';
import { parkrunEvent } from './models/parkrunEvent';

console.log('Parkrun Project Initialized');

getEvents().then((events: parkrunEvent[]) => {
  if (events.length > 0) {
    renderMap(events);
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
  }
});