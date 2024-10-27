interface Event {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export function renderMap(events: Event[]): void {
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

  // Draw a simple rectangle as a placeholder for the map
  context.fillStyle = 'green';
  context.fillRect(10, 10, 100, 100);

  // Render event data points
  events.forEach(event => {
    const x = (event.longitude + 180) * (canvas.width / 360); // Convert longitude to x coordinate
    const y = (90 - event.latitude) * (canvas.height / 180); // Convert latitude to y coordinate

    context.fillStyle = 'red';
    context.beginPath();
    context.arc(x, y, 5, 0, 2 * Math.PI);
    context.fill();

    context.fillStyle = 'black';
    context.fillText(event.name, x + 10, y);
  });

  console.log('Map rendered successfully');
}