import { parkrunEvent } from './models/parkrunEvent';

export function renderMap(events: parkrunEvent[]): void {
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

  // Render event data points
  events.forEach(event => {
    const [longitude, latitude] = event.geometry.coordinates;
    const x = (longitude + 180) * (canvas.width / 360); // Convert longitude to x coordinate
    const y = (90 - latitude) * (canvas.height / 180); // Convert latitude to y coordinate

    context.fillStyle = 'red';
    context.beginPath();
    context.arc(x, y, 5, 0, 2 * Math.PI);
    context.fill();

    context.fillStyle = 'black';
    context.fillText(event.properties.EventLongName , x + 10, y);
  });

  console.log(`Map rendered ${events.length} events.`);
}