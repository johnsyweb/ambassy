import { EventTeam } from './models/EventTeam';

interface EventPoint {
  team: EventTeam;
  x: number;
  y: number;
}

let zoomLevel = 2.2;
const zoomFactor = 1.2;

export function renderMap(eventTeams: EventTeam[]): void {
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

  // Render event team data points
  eventTeams.forEach(team => {
    if (team['associatedEvent']) {
      const [longitude, latitude] = team['associatedEvent'].geometry.coordinates;
      const x = (longitude + 180) * zoomLevel; // Convert longitude to x coordinate
      const y = (90 - latitude) * zoomLevel; // Convert latitude to y coordinate

      const color = 'purple';

      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, 5, 0, 2 * Math.PI);
      context.fill();
      // Draw the event short name below the circle
      context.fillStyle = 'black';
      context.font = '12px Arial';
      context.textAlign = 'center';
      context.fillText(team.eventShortName, x, y + 15);
      // Store the event point
      eventPoints.push({ team, x, y });
    }
  });

  console.log(`Map rendered ${eventTeams.length} teams successfully`);

  // Add mousemove event listener to the canvas
  canvas.addEventListener('mousemove', (e) => handleCanvasMouseMove(e, eventPoints));
}

function handleCanvasMouseMove(event: MouseEvent, eventPoints: EventPoint[]): void {
  const canvas = event.target as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Check if any event point is being hovered over
  const hoveredEvent = eventPoints.find(point => {
    const dx = point.x - x;
    const dy = point.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 5 * zoomLevel; // Check if the mouse is within the radius of the point
  });

  if (hoveredEvent) {
    displayEventDetails(hoveredEvent.team);
  } else {
    hideEventDetails();
  }
}

function displayEventDetails(team: EventTeam): void {
  const detailsDiv = document.getElementById('eventDetails');
  if (detailsDiv) {
    detailsDiv.innerHTML = `
      <strong>Event:</strong> ${team.eventShortName}<br>
      <strong>Event Director:</strong> ${team.eventDirector}<br>
      <strong>Co-Event Director:</strong> ${team.coEventDirector || 'N/A'}<br>
      <strong>Location:</strong> ${team['associatedEvent']?.properties.EventLocation || 'N/A'}
    `;
    detailsDiv.style.display = 'block';
  }
}

function hideEventDetails(): void {
  const detailsDiv = document.getElementById('eventDetails');
  if (detailsDiv) {
    detailsDiv.style.display = 'none';
  }
}

function displayMapExtents(minLongitude: number, maxLongitude: number, minLatitude: number, maxLatitude: number, zoomLevel: number): void {
  const mapExtentsDiv = document.getElementById('mapExtents');
  if (mapExtentsDiv) {
    mapExtentsDiv.innerHTML = `
      <strong>Map Extents:</strong><br>
      Longitude: ${minLongitude.toFixed(2)} to ${maxLongitude.toFixed(2)}<br>
      Latitude: ${minLatitude.toFixed(2)} to ${maxLatitude.toFixed(2)}<br>
      <strong>Scale:</strong> 1:${(1 / zoomLevel).toFixed(2)}
    `;
  }
}

export function zoomIn(eventTeams: EventTeam[]): void {
  zoomLevel *= zoomFactor;
  renderMap(eventTeams);
}

export function zoomOut(eventTeams: EventTeam[]): void {
  zoomLevel /= zoomFactor;
  renderMap(eventTeams);
}