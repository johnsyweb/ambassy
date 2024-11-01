import { RegionalAmbassadorMap } from '../models/RegionalAmbassadorMap';

export function populateEventTeamsTable(regionalAmbassadors: RegionalAmbassadorMap): void {
  const tableBody = document.getElementById('eventTeamsTable')?.getElementsByTagName('tbody')[0];
  if (!tableBody) {
    console.error('Table body not found');
    return;
  }

  // Clear existing rows
  tableBody.innerHTML = '';

  regionalAmbassadors.forEach((raName, ra) => { console.log(raName, ra); });


  // Populate table with event team data
  regionalAmbassadors.forEach((ra, raName) => {
    console.log("Building rows with", ra);
    ra.supportsEAs.forEach(ea => {
      console.log("Building a row with", raName, ea);
      // ea.supportedEventTeams?.forEach(team => {
      //   console.log("Building a row with", raName, ea, team);
      //   const row = tableBody.insertRow();
      //   const raNameCell = row.insertCell(0);
      //   const eaNameCell = row.insertCell(1);
      //   const eventNameCell = row.insertCell(2);
      //   const eventDirectorsCell = row.insertCell(3);
      //   const eventCoordinatesCell = row.insertCell(4);

      //   raNameCell.textContent = raName;
      //   eaNameCell.textContent = ea.name;
      //   eventNameCell.textContent = team.eventShortName;
      //   eventDirectorsCell.textContent = team.eventDirectors.join(', ');
      //   eventCoordinatesCell.textContent = team.associatedEvent
      //     ? `${team.associatedEvent.geometry.coordinates[1]}, ${team.associatedEvent.geometry.coordinates[0]}`
      //     : 'N/A';
      // });
    });
  });
}