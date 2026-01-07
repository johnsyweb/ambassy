import Papa from 'papaparse';
import { parseEventTeams, EventTeamRow } from '@parsers/parseEventTeams';
import { parseEventAmbassadors, EventAmbassadorRow } from '@parsers/parseEventAmbassadors';
import { parseRegionalAmbassadors, RegionalAmbassadorRow } from '@parsers/parseRegionalAmbassadors';
import { FileUploadCallback } from '@localtypes/FileUploadCallback';
import { persistEventAmbassadors } from './persistState';
import { persistEventTeams } from './persistState';
import { persistRegionalAmbassadors } from './persistState';

export function handleFileUpload(file: File, callback: FileUploadCallback): void {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const data = results.data;
      if (file.name.includes('Event Ambassadors')) {
        const eventAmbassadors = parseEventAmbassadors(data as EventAmbassadorRow[]);
        persistEventAmbassadors(eventAmbassadors);
        callback('Event Ambassadors');
      } else if (file.name.includes('Event Teams')) {
        const eventTeams = parseEventTeams(data as EventTeamRow[]);
        persistEventTeams(eventTeams);
        callback('Event Teams');
      } else if (file.name.includes('Regional Ambassadors')) {
        const regionalAmbassadors = parseRegionalAmbassadors(data as RegionalAmbassadorRow[]);
        persistRegionalAmbassadors(regionalAmbassadors);
        callback('Regional Ambassadors');
      }
    },
    error: (error) => {
      console.error('Error parsing CSV file:', error);
    }
  });
}
