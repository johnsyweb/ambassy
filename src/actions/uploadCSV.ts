import Papa from 'papaparse';
import { parseEventTeams, EventTeamRow } from '@parsers/parseEventTeams';
import { parseEventAmbassadors, EventAmbassadorRow } from '@parsers/parseEventAmbassadors';
import { parseRegionalAmbassadors, RegionalAmbassadorRow } from '@parsers/parseRegionalAmbassadors';
import { FileUploadCallback } from "@localtypes/FileUploadCallback";
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
        // Validate that the CSV has the expected headers
        if (data.length > 0) {
          const firstRow = data[0] as Record<string, unknown>;
          const hasExpectedHeaders = 
            'RA Name' in firstRow || 
            'RA State' in firstRow || 
            'EA Name' in firstRow;
          
          // Check if this looks like a headerless file (first row has values but no expected headers)
          const firstRowKeys = Object.keys(firstRow);
          const looksLikeHeaderless = firstRowKeys.length > 0 && 
            firstRowKeys.some(key => 
              !['RA Name', 'RA State', 'EA Name'].includes(key) &&
              typeof firstRow[key] === 'string' &&
              (firstRow[key] as string).length > 0
            );
          
          if (!hasExpectedHeaders && looksLikeHeaderless) {
            alert(
              'Invalid CSV format for Regional Ambassadors file.\n\n' +
              'Expected columns: "RA Name", "RA State", "EA Name"\n\n' +
              'Your file appears to be missing headers. Please ensure the first row contains:\n' +
              '- Column 1: RA Name\n' +
              '- Column 2: RA State\n' +
              '- Column 3: EA Name\n\n' +
              'Empty cells in the RA Name column indicate continuation from the previous row.'
            );
            return;
          }
        }
        
        try {
          const regionalAmbassadors = parseRegionalAmbassadors(data as RegionalAmbassadorRow[]);
          persistRegionalAmbassadors(regionalAmbassadors);
          callback('Regional Ambassadors');
        } catch (error) {
          alert(
            'Error parsing Regional Ambassadors file:\n\n' +
            (error instanceof Error ? error.message : String(error)) +
            '\n\nPlease ensure your CSV file has the correct format with headers: "RA Name", "RA State", "EA Name"'
          );
        }
      }
    },
    error: (error) => {
      console.error('Error parsing CSV file:', error);
      alert('Error reading CSV file. Please ensure it is a valid CSV file.');
    }
  });
}
