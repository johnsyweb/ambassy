import { parseRegionalAmbassadors, RegionalAmbassadorRow } from './parseRegionalAmbassadors';
import { RegionalAmbassadorMap } from '../models/RegionalAmbassadorMap';

describe('parseRegionalAmbassadors', () => {
  it('should parse regional ambassadors correctly', () => {
    const data: RegionalAmbassadorRow[] = [
      { 'RA Name': 'John Doe', 'RA State': 'VIC', 'EA Name': 'Jane Smith' },
      { 'RA Name': '',         'RA State': '',    'EA Name': 'Bob Johnson' },
      { 'RA Name': 'Alice Brown', 'RA State': 'NSW', 'EA Name': 'Charlie Davis' }
    ];

    const result: RegionalAmbassadorMap = parseRegionalAmbassadors(data);

    expect(result.size).toBe(2);

    const johnDoe = result.get('John Doe');
    expect(johnDoe).toBeDefined();
    expect(johnDoe?.name).toBe('John Doe');
    expect(johnDoe?.state).toBe('VIC');
    expect(johnDoe?.supportsEAs).toEqual(['Jane Smith', 'Bob Johnson']);

    const aliceBrown = result.get('Alice Brown');
    expect(aliceBrown).toBeDefined();
    expect(aliceBrown?.name).toBe('Alice Brown');
    expect(aliceBrown?.state).toBe('NSW');
    expect(aliceBrown?.supportsEAs).toEqual(['Charlie Davis']);
  });

  it('should handle empty data', () => {
    const data: RegionalAmbassadorRow[] = [];

    const result: RegionalAmbassadorMap = parseRegionalAmbassadors(data);

    expect(result.size).toBe(0);
  });
});