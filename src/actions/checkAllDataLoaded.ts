import { EventTeam } from '../models/EventTeam';

export function checkAllDataLoaded(
  isEventTeamsLoaded: boolean,
  isRegionalAmbassadorsLoaded: boolean,
  isEventAmbassadorsLoaded: boolean,
  eventTeams: EventTeam[],
  renderMap: (eventTeams: EventTeam[]) => void,
  populateEventTeamsTable: (eventTeams: EventTeam[]) => void
): void {
  if (isEventTeamsLoaded && isRegionalAmbassadorsLoaded && isEventAmbassadorsLoaded) {
    document.getElementById('map')!.style.display = 'block';
    document.getElementById('eventTeamsTable')!.style.display = 'block';
    renderMap(eventTeams);
    populateEventTeamsTable(eventTeams);
  }
}