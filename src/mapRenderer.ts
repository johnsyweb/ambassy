import { parkrunEvent } from './models/parkrunEvent';
import { RegionalAmbassador } from './models/regionalAmbassador';

interface EventPoint {
  event: parkrunEvent;
  x: number;
  y: number;
}

export function renderMap(events: parkrunEvent[], regionalAmbassadors: RegionalAmbassador[], highlightCategory: string = ''): void {
  if (typeof document === 'undefined') {
    console.error('Document is not defined. This function should be run in a browser environment.');
    return;
  }

  const canvas = document.getElementById('mapCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    console.error('Failed to get canvas context');
    return;
  }

  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Store event points
  const eventPoints: EventPoint[] = [];

  // Render home event data points
  events.forEach(event => {
    const [longitude, latitude] = event.geometry.coordinates;
    const x = (longitude + 180) * (canvas.width / 360); // Convert longitude to x coordinate
    const y = (90 - latitude) * (canvas.height / 180); // Convert latitude to y coordinate

    // Determine the color based on the highlight category
    let color = 'purple';
    // if (highlightCategory === 'EventDirector' && event.properties.EventDirector) {
    //   color = 'blue';
    // } else if (highlightCategory === 'CoEventDirector' && event.properties.CoEventDirector) {
    //   color = 'green';
    // }

    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, 5, 0, 2 * Math.PI);
    context.fill();

    context.fillStyle = 'black';
    context.fillText(event.properties.EventShortName, x + 10, y);

    // Store the event point
    eventPoints.push({ event, x, y });
  });

  console.log(`Map rendered ${events.length} events successfully`);

  // Add click event listener to the canvas
  canvas.addEventListener('click', (e) => handleCanvasClick(e, eventPoints));
}

function handleCanvasClick(event: MouseEvent, eventPoints: EventPoint[]): void {
  const canvas = event.target as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Check if any event point was clicked
  const clickedEvent = eventPoints.find(point => {
    const dx = point.x - x;
    const dy = point.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 5; // Check if the click is within the radius of the point
  });

  if (clickedEvent) {
    displayEventDetails(clickedEvent.event);
  }
}

function displayEventDetails(event: parkrunEvent): void {
  // Display event details (e.g., in an alert or a modal)
  alert(`Event: ${event.properties.EventLongName}\nLocation: ${event.properties.EventLocation}`);
}