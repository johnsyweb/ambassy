import { handleFileUpload } from './uploadCSV';
import { EventTeam } from './models/EventTeam';
import { EventAmbassador } from './models/EventAmbassador';

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

document.getElementById('uploadButton')?.addEventListener('click', () => {
  const input = document.getElementById('csvFileInput') as HTMLInputElement;
  if (input && input.files && input.files.length > 0) {
    const file = input.files[0];
    handleFileUpload(file);
  } else {
    alert('Please select a CSV file to upload.');
  }
});