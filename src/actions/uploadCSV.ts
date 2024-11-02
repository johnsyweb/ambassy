import Papa from 'papaparse';
import { parseEventTeams, EventTeamRow } from '@parsers/parseEventTeams';
import { parseEventAmbassadors, EventAmbassadorRow } from '@parsers/parseEventAmbassadors';
import { parseRegionalAmbassadors, RegionalAmbassadorRow } from '@parsers/parseRegionalAmbassadors';
import { FileUploadCallback } from '@localtypes/FileUploadCallback';

export function handleFileUpload(file: File, callback: FileUploadCallback): void {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const data = results.data;
      if (file.name.includes('Event Ambassadors')) {
        const eventAmbassadors = parseEventAmbassadors(data as EventAmbassadorRow[]);
        sessionStorage.setItem('Event Ambassadors', JSON.stringify(Array.from(eventAmbassadors.entries())));
        callback('Event Ambassadors');
      } else if (file.name.includes('Event Teams')) {
        const eventTeams = parseEventTeams(data as EventTeamRow[]);
        sessionStorage.setItem('Event Teams', JSON.stringify(Array.from(eventTeams)));
        callback('Event Teams');
      } else if (file.name.includes('Regional Ambassadors')) {
        const regionalAmbassadors = parseRegionalAmbassadors(data as RegionalAmbassadorRow[]);
        sessionStorage.setItem('Regional Ambassadors', JSON.stringify(Array.from(regionalAmbassadors.entries())));
        callback('Regional Ambassadors');
      }
    },
    error: (error) => {
      console.error('Error parsing CSV file:', error);
    }
  });
}
