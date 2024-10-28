import Papa from 'papaparse';
import { parseEventTeams } from './parsers/parseEventTeams';
import { parseEventAmbassadors } from './parsers/parseEventAmbassadors';
import { parseRegionalAmbassadors } from './parsers/parseRegionalAmbassadors';

export function handleFileUpload(file: File, callback: (type: string) => void): void {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const data = results.data as any[];
      if (file.name.includes('Event Ambassadors')) {
        const eventAmbassadors = parseEventAmbassadors(data);
        console.log('Parsed Event Ambassadors:', eventAmbassadors);
        // Store event ambassadors in session storage
        sessionStorage.setItem('eventAmbassadors', JSON.stringify(eventAmbassadors));
        callback('Event Ambassadors');
      } else if (file.name.includes('Event Teams')) {
        const eventTeams = parseEventTeams(data);
        console.log('Parsed Event Teams:', eventTeams);
        // Store event teams in session storage
        sessionStorage.setItem('eventTeams', JSON.stringify(eventTeams));
        callback('Event Teams');
      } else if (file.name.includes('Regional Ambassadors')) {
        const regionalAmbassadors = parseRegionalAmbassadors(data);
        console.log('Parsed Regional Ambassadors:', regionalAmbassadors);
        // Store regional ambassadors in session storage
        sessionStorage.setItem('regionalAmbassadors', JSON.stringify(regionalAmbassadors));
        callback('Regional Ambassadors');
      }
    },
    error: (error) => {
      console.error('Error parsing CSV file:', error);
    }
  });
}
