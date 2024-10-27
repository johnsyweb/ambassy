import { getEvents } from './fetchEvents';
import { renderMap } from './mapRenderer';

console.log('Ambassy Project Initialized');

getEvents().then(events => {
  const debugArea = document.getElementById('debug');
  if (debugArea) {
    debugArea.innerText = JSON.stringify(events, null, 2); 
 }
  if (events) {
    renderMap(events);
  } else {
    console.error('Failed to fetch events');
  }
});