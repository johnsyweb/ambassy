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

enum UploadState {
  EventAmbassadors,
  EventTeams,
  RegionalAmbassadors,
  Complete
}

let uploadState = UploadState.EventAmbassadors;

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
  const eventTeamsTableContainer = document.getElementById('eventTeamsTableContainer');

  if (!h1Element || !uploadPrompt || !csvFileInput || !uploadButton || !eventTeamsTableContainer) {
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


    // Update the UI
    h1Element.textContent = 'Ambassy';
    uploadPrompt.style.display = 'none';
    csvFileInput.style.display = 'none';
    uploadButton.style.display = 'none';
    eventTeamsTableContainer.style.display = 'block';

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