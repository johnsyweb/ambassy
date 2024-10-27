export function renderMap(): void {
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

  console.log('Map rendered successfully');
}