import Papa from 'papaparse';
import { parseEventTeams } from './parsers/parseEventTeams';

export function handleFileUpload(file: File): void {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const data = results.data as any[];
      const eventTeams = parseEventTeams(data);
      console.log('Parsed Event Teams:', eventTeams);
      // You can add further processing or storage of eventTeams here
    },
    error: (error) => {
      console.error('Error parsing CSV file:', error);
    }
  });
}
