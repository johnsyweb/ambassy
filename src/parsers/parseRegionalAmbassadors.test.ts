import { parseRegionalAmbassadors, RegionalAmbassadorRow } from './parseRegionalAmbassadors';
import { RegionalAmbassadorMap } from '../models/RegionalAmbassadorMap';

describe('parseRegionalAmbassadors', () => {
  it('should parse regional ambassadors correctly', () => {
    const data: RegionalAmbassadorRow[] = [
      { 'RA Name': 'John Doe', 'RA State': 'CA', 'EA Name': 'Jane Smith' },
      { 'RA Name': 'John Doe', 'RA State': 'CA', 'EA Name': 'Bob Johnson' },
      { 'RA Name': 'Alice Brown', 'RA State': 'NY', 'EA Name': 'Charlie Davis' }
    ];

    const result: RegionalAmbassadorMap = parseRegionalAmbassadors(data);

    expect(result.size).toBe(2);

    const johnDoe = result.get('John Doe');
    expect(johnDoe).toBeDefined();
    expect(johnDoe?.name).toBe('John Doe');
    expect(johnDoe?.state).toBe('CA');
    expect(johnDoe?.supportsEAs).toEqual(['Jane Smith', 'Bob Johnson']);

    const aliceBrown = result.get('Alice Brown');
    expect(aliceBrown).toBeDefined();
    expect(aliceBrown?.name).toBe('Alice Brown');
    expect(aliceBrown?.state).toBe('NY');
    expect(aliceBrown?.supportsEAs).toEqual(['Charlie Davis']);
  });

  it('should handle empty data', () => {
    const data: RegionalAmbassadorRow[] = [];

    const result: RegionalAmbassadorMap = parseRegionalAmbassadors(data);

    expect(result.size).toBe(0);
  });

  it('should handle data with missing EA names', () => {
    const data: RegionalAmbassadorRow[] = [
      { 'RA Name': 'John Doe', 'RA State': 'CA', 'EA Name': '' },
      { 'RA Name': 'John Doe', 'RA State': 'CA', 'EA Name': 'Bob Johnson' },
      { 'RA Name': 'Alice Brown', 'RA State': 'NY', 'EA Name': '' }
    ];

    const result: RegionalAmbassadorMap = parseRegionalAmbassadors(data);

    expect(result.size).toBe(2);

    const johnDoe = result.get('John Doe');
    expect(johnDoe).toBeDefined();
    expect(johnDoe?.name).toBe('John Doe');
    expect(johnDoe?.state).toBe('CA');
    expect(johnDoe?.supportsEAs).toEqual(['Bob Johnson']);

    const aliceBrown = result.get('Alice Brown');
    expect(aliceBrown).toBeDefined();
    expect(aliceBrown?.name).toBe('Alice Brown');
    expect(aliceBrown?.state).toBe('NY');
    expect(aliceBrown?.supportsEAs).toEqual([]);
  });
});