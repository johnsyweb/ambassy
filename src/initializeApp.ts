import { EventTeam } from './models/EventTeam';
import { populateEventTeamsTable } from './utils/populateEventTeamsTable';
import { renderMap } from './mapRenderer';
import { associateEventTeamsWithParkRunEvents } from './utils/associateEventTeamsWithParkRunEvents';
import { ParkRunEvent } from './models/parkrunEvent';
import { RegionalAmbassador } from './models/regionalAmbassador';
import { EventAmbassador } from './models/EventAmbassador';
import { checkAllDataLoaded } from './utils/checkAllDataLoaded';

let parkRunEvents: ParkRunEvent[] = [];

export async function initializeApp(): Promise<void> {
 
  // Load data from sessionStorage
  const storedEventTeams = sessionStorage.getItem('eventTeams');
  const storedRegionalAmbassadors = sessionStorage.getItem('regionalAmbassadors');
  const storedEventAmbassadors = sessionStorage.getItem('eventAmbassadors');

  let eventTeams: EventTeam[] = [];
  let regionalAmbassadors: RegionalAmbassador[] = [];
  let eventAmbassadors: EventAmbassador[] = [];

  if (storedEventTeams) {
    eventTeams = JSON.parse(storedEventTeams);
  }

  if (storedRegionalAmbassadors) {
    regionalAmbassadors = JSON.parse(storedRegionalAmbassadors);
  }

  if (storedEventAmbassadors) {
    eventAmbassadors = JSON.parse(storedEventAmbassadors);
  }

  // Associate event teams with ParkRun events
  eventTeams = associateEventTeamsWithParkRunEvents(eventTeams, parkRunEvents);

  // Check if all data is loaded and update the UI
  checkAllDataLoaded(
    eventTeams.length > 0,
    regionalAmbassadors.length > 0,
    eventAmbassadors.length > 0,
    eventTeams,
    renderMap,
    populateEventTeamsTable
  );
}