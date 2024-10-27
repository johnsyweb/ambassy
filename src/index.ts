import { getEvents } from './fetchEvents';
import { renderMap } from './mapRenderer';

console.log('Ambassy Project Initialized');

getEvents().then(events => {
  if (events) {
    renderMap(events);
  } else {
    console.error('Failed to fetch events');
  }
});