export function checkAllDataLoaded(
  isEventTeamsLoaded: boolean,
  isRegionalAmbassadorsLoaded: boolean,
  isEventAmbassadorsLoaded: boolean,
  eventTeams: any[],
  renderMap: (eventTeams: any[]) => void,
  populateEventTeamsTable: (eventTeams: any[]) => void
): void {
  if (isEventTeamsLoaded && isRegionalAmbassadorsLoaded && isEventAmbassadorsLoaded) {
    document.getElementById('map')!.style.display = 'block';
    document.getElementById('eventTeamsTable')!.style.display = 'block';
    renderMap(eventTeams);
    populateEventTeamsTable(eventTeams);
  }
}