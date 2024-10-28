import { handleFileUpload } from './uploadCSV';
import { EventTeam } from './models/EventTeam';
import { EventAmbassador } from './models/EventAmbassador';
import { RegionalAmbassador } from './models/regionalAmbassador';
import { getEvents } from './fetchEvents';
import { ParkRunEvent } from './models/parkrunEvent';
import { associateEventTeamsWithParkRunEvents } from './utils/associateEventTeamsWithParkRunEvents';
import { populateEventTeamsTable } from './utils/populateEventTeamsTable';
import { associateEventAmbassadorsWithEventTeams } from './utils/associateEventAmbassadorsWithEventTeams';
import { associateRegionalAmbassadorsWithEventAmbassadors } from './utils/associateRegionalAmbassadorsWithEventAmbassadors';
import L from 'leaflet';
import * as d3 from 'd3';
import * as d3GeoVoronoi from 'd3-geo-voronoi';

enum UploadState {
  EventAmbassadors,
  EventTeams,
  RegionalAmbassadors,
  Complete
}

let uploadState = UploadState.EventAmbassadors;
let map: L.Map

const colorPalette = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFF5', '#FF8C33', '#33FF8C', '#8C33FF', '#FF338C'
];

function assignColorsToRAs(regionalAmbassadors: RegionalAmbassador[]): Map<string, string> {
  const raColorMap = new Map<string, string>();
  regionalAmbassadors.forEach((ra, index) => {
    raColorMap.set(ra.name, colorPalette[index % colorPalette.length]);
  });
  return raColorMap;
}

function assignColorsToEAs(eas: EventAmbassador[]): Map<string, string> {
  const eaColorMap = new Map<string, string>();
  eas.forEach((ea, index) => {
    eaColorMap.set(ea.name, colorPalette[index % colorPalette.length]);
  });
  return eaColorMap;
}

function updatePrompt() {
  const uploadPrompt = document.getElementById('uploadPrompt');
  if (!uploadPrompt) return;

  switch (uploadState) {
    case UploadState.EventAmbassadors:
      uploadPrompt.textContent = 'Please upload the Event Ambassadors CSV file.';
      break;
    case UploadState.EventTeams:
      uploadPrompt.textContent = 'Please upload the Event Teams CSV file.';
      break;
    case UploadState.RegionalAmbassadors:
      uploadPrompt.textContent = 'Please upload the Regional Ambassadors CSV file.';
      break;
    case UploadState.Complete:
      uploadPrompt.textContent = 'All files uploaded successfully!';
      break;
  }
}

async function checkAllDataLoaded() {
  const h1Element = document.querySelector('h1');
  const uploadPrompt = document.getElementById('uploadPrompt');
  const csvFileInput = document.getElementById('csvFileInput');
  const uploadButton = document.getElementById('uploadButton');
  const mapContainer = document.getElementById('mapContainer');

  const eventTeamsTableContainer = document.getElementById('eventTeamsTableContainer');

  if (!h1Element || !uploadPrompt || !csvFileInput || !uploadButton || !eventTeamsTableContainer || !mapContainer) {
    console.error('Required elements not found');
    return;
  }

  if (isEventTeamsLoaded && isRegionalAmbassadorsLoaded && isEventAmbassadorsLoaded) {
    const storedParkRunEvents = sessionStorage.getItem('parkRunEvents');
    let parkRunEvents: ParkRunEvent[] = [];

    if (storedParkRunEvents) {
      parkRunEvents = JSON.parse(storedParkRunEvents);
    } else {
      parkRunEvents = await getEvents();
    }

    eventTeams = associateEventTeamsWithParkRunEvents(eventTeams, parkRunEvents);
    console.log('Associated Event Teams with ParkRun Events:', eventTeams);

    eventAmbassadors = associateEventAmbassadorsWithEventTeams(eventAmbassadors, eventTeams);
    console.log('Associated Event Ambassadors with Event Teams:', eventAmbassadors);

    regionalAmbassadors = associateRegionalAmbassadorsWithEventAmbassadors(regionalAmbassadors, eventAmbassadors);
    console.log('Associated Regional Ambassadors with Event Ambassadors:', regionalAmbassadors);

    const raColorMap = assignColorsToRAs(regionalAmbassadors);
    const eaColorMap = assignColorsToEAs(eventAmbassadors);

    // Update the UI
    h1Element.textContent = 'Ambassy';
    uploadPrompt.style.display = 'none';
    csvFileInput.style.display = 'none';
    uploadButton.style.display = 'none';
    mapContainer.style.display = 'block';
    eventTeamsTableContainer.style.display = 'block';

    // Initialize the map
    map = L.map('mapContainer').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Collect points for Voronoi diagram
    const points: [number, number, string][] = [];

    // Add dots for each event team
    regionalAmbassadors.forEach(ra => {
      ra?.eventAmbassadors?.forEach(ea => {
        const raColor = raColorMap.get(ra.name) || '#000000'; 
     
        ea?.supportedEventTeams?.forEach(team => {
          if (team.associatedEvent) {
            const eaColor = eaColorMap.get(ea.name) || '#000000'; 
     
            const [lng, lat] = team.associatedEvent.geometry.coordinates;
            const tooltip = `
              <strong>Event:</strong> ${team.eventShortName}<br>
              <strong>Event Director(s):</strong> ${team.eventDirectors.join(', ')}<br>
              <strong>Event Ambassador:</strong> ${ea.name}<br>
              <strong>Regional Ambassador:</strong> ${ra.name}
            `
            points.push([lng, lat, JSON.stringify({ raColor, tooltip })]);
            const marker = L.circleMarker([lat, lng], { radius: 5, color: eaColor }).addTo(map);
            marker.bindTooltip(tooltip);
          }
        });
      });
    });

        // Generate Voronoi diagram
        const voronoi = d3GeoVoronoi.geoVoronoi(points.map(p => [p[0], p[1]]));
        const polygons = voronoi.polygons();
    
        // Add Voronoi cells to the map
        polygons.features.forEach((feature, index) => {

          const { raColor, tooltip } = JSON.parse(points[index][2]);     
          const coordinates = (feature.geometry.coordinates[0] as [number, number][]).map((coord) => [coord[1], coord[0]] as L.LatLngTuple);
          const poly = L.polygon(coordinates, { color: raColor, fillOpacity: 0.2 }).addTo(map);
          poly.bindTooltip(tooltip); 
        });
    

    // Populate the event teams table
    populateEventTeamsTable(regionalAmbassadors);
  } else {
    let missingFilesMessage = 'Please upload the following missing files: ';
    const missingFiles = [];
    if (!isEventTeamsLoaded) missingFiles.push('Event Teams CSV');
    if (!isRegionalAmbassadorsLoaded) missingFiles.push('Regional Ambassadors CSV');
    if (!isEventAmbassadorsLoaded) missingFiles.push('Event Ambassadors CSV');
    missingFilesMessage += missingFiles.join(', ');
    uploadPrompt.textContent = missingFilesMessage;
  }
}

// Retrieve stored event teams from session storage
let eventTeams: EventTeam[] = [];
const storedEventTeams = sessionStorage.getItem('eventTeams');
if (storedEventTeams) {
  eventTeams = JSON.parse(storedEventTeams);
  console.log('Retrieved Event Teams from session storage:', eventTeams);
}

// Retrieve stored event ambassadors from session storage
let eventAmbassadors: EventAmbassador[] = [];
const storedEventAmbassadors = sessionStorage.getItem('eventAmbassadors');
if (storedEventAmbassadors) {
  eventAmbassadors = JSON.parse(storedEventAmbassadors);
  console.log('Retrieved Event Ambassadors from session storage:', eventAmbassadors);
}

// Retrieve stored regional ambassadors from session storage
let regionalAmbassadors: RegionalAmbassador[] = [];
const storedRegionalAmbassadors = sessionStorage.getItem('regionalAmbassadors');
if (storedRegionalAmbassadors) {
  regionalAmbassadors = JSON.parse(storedRegionalAmbassadors);
  console.log('Retrieved Regional Ambassadors from session storage:', regionalAmbassadors);
}

let isEventTeamsLoaded = !!storedEventTeams;
let isRegionalAmbassadorsLoaded = !!storedRegionalAmbassadors;
let isEventAmbassadorsLoaded = !!storedEventAmbassadors;

document.getElementById('uploadButton')?.addEventListener('click', () => {
  const input = document.getElementById('csvFileInput') as HTMLInputElement;
  if (input && input.files && input.files.length > 0) {
    const file = input.files[0];
    handleFileUpload(file, (type) => {
      if (type === 'Event Ambassadors') {
        isEventAmbassadorsLoaded = true;
        uploadState = UploadState.EventTeams;
      } else if (type === 'Event Teams') {
        isEventTeamsLoaded = true;
        uploadState = UploadState.RegionalAmbassadors;
      } else if (type === 'Regional Ambassadors') {
        isRegionalAmbassadorsLoaded = true;
        uploadState = UploadState.Complete;
      }
      updatePrompt();
      checkAllDataLoaded();
    });
  } else {
    alert('Please select a CSV file to upload.');
  }
});

updatePrompt();

// Fetch events when the page loads
getEvents();
checkAllDataLoaded();