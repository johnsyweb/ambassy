import Papa from 'papaparse';
import { parseEventTeams } from './parsers/parseEventTeams';
import { parseEventAmbassadors } from './parsers/parseEventAmbassadors';

export function handleFileUpload(file: File): void {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const data = results.data as any[];
      if (file.name.includes('Event Teams')) {
        const eventTeams = parseEventTeams(data);
        console.log('Parsed Event Teams:', eventTeams);
        // Store event teams in session storage
        sessionStorage.setItem('eventTeams', JSON.stringify(eventTeams));
      } else if (file.name.includes('Event Ambassadors')) {
        const eventAmbassadors = parseEventAmbassadors(data);
        console.log('Parsed Event Ambassadors:', eventAmbassadors);
        // Store event ambassadors in session storage
        sessionStorage.setItem('eventAmbassadors', JSON.stringify(eventAmbassadors));
      }
    },
    error: (error) => {
      console.error('Error parsing CSV file:', error);
    }
  });
}
