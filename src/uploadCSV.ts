import Papa from 'papaparse';
import { RegionalAmbassador } from './models/regionalAmbassador';
import { EventAmbassador } from './models/eventAmbassador';
import { EventTeam } from './models/eventTeam';

export function handleFileUpload(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files) {
    console.error('No files selected');
    return;
  }

  Array.from(input.files).forEach(file => {
    const fileType = getFileType(file.name); // Determine the type of CSV file

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data as any[];

        if (fileType === 'RegionalAmbassador') {
          const regionalAmbassadors: RegionalAmbassador[] = data.map(row => ({
            parkrunId: row['parkrun ID'],
            name: row['Name'],
            homeEvent: row['Home parkrun event'],
            supportsEAs: Object.keys(row)
              .filter(key => key.startsWith('Supports EA') && row[key])
              .map(key => row[key])
          }));
          console.log('Parsed Regional Ambassadors:', regionalAmbassadors);
          // Process the parsed data as needed
        } else if (fileType === 'EventAmbassador') {
          const eventAmbassadors: EventAmbassador[] = data.map(row => ({
            parkrunId: row['parkrun ID'],
            name: row['Name'],
            homeEvent: row['Home parkrun event'],
            supportsEvents: Object.keys(row)
              .filter(key => key.startsWith('Supports Event') && row[key])
              .map(key => row[key])
          }));
          console.log('Parsed Event Ambassadors:', eventAmbassadors);
          // Process the parsed data as needed
        } else if (fileType === 'EventTeam') {
          const eventTeams: EventTeam[] = data.map(row => ({
            eventShortName: row['Event Short Name'],
            eventDirector: row['Event Director'],
            coEventDirector: row['Co-Event Director'] || undefined
          }));
          console.log('Parsed Event Teams:', eventTeams);
          // Process the parsed data as needed
        } else {
          console.error('Unknown file type:', fileType, 'for file:', file.name);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV file:', error);
      }
    });
  });
}

function getFileType(fileName: string): string {
  if (fileName.includes('Regional Ambassador')) {
    return 'RegionalAmbassador';
  } else if (fileName.includes('Event Ambassador')) {
    return 'EventAmbassador';
  } else if (fileName.includes('Event Team')) {
    return 'EventTeam';
  } else {
    return 'Unknown';
  }
}
