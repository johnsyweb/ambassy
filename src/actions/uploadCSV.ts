import Papa from 'papaparse';
import { parseEventTeams, EventTeamRow } from '../parsers/parseEventTeams';
import { parseEventAmbassadors, EventAmbassadorRow } from '../parsers/parseEventAmbassadors';
import { parseRegionalAmbassadors, RegionalAmbassadorRow } from '../parsers/parseRegionalAmbassadors';

export type FileUploadType = 'Event Ambassadors' | 'Event Teams' | 'Regional Ambassadors';

export function handleFileUpload(file: File, callback: (type: FileUploadType) => void): void {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const data = results.data;
      if (file.name.includes('Event Ambassadors')) {
        const eventAmbassadors = parseEventAmbassadors(data as EventAmbassadorRow[]);
        console.log('Parsed Event Ambassadors:', eventAmbassadors);
        sessionStorage.setItem('eventAmbassadors', JSON.stringify(eventAmbassadors));
        callback('Event Ambassadors');
      } else if (file.name.includes('Event Teams')) {
        const eventTeams = parseEventTeams(data as EventTeamRow[]);
        console.log('Parsed Event Teams:', eventTeams);
        sessionStorage.setItem('eventTeams', JSON.stringify(eventTeams));
        callback('Event Teams');
      } else if (file.name.includes('Regional Ambassadors')) {
        const regionalAmbassadors = parseRegionalAmbassadors(data as RegionalAmbassadorRow[]);
        console.log('Parsed Regional Ambassadors:', regionalAmbassadors);
        sessionStorage.setItem('regionalAmbassadors', JSON.stringify(regionalAmbassadors));
        callback('Regional Ambassadors');
      }
    },
    error: (error) => {
      console.error('Error parsing CSV file:', error);
    }
  });
}
