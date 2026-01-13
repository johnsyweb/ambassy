import { parseProspectiveEventsCSV } from './parseProspectiveEvents';

describe('parseProspectiveEventsCSV', () => {
  const validHeaders = 'Prospect Event,Country,State,Prospect ED/s,EA,Date Made Contact,Course Found,Landowner Permission,Funding Confirmed';

  describe('valid CSV parsing', () => {
    it('should parse a complete valid CSV', () => {
      const csv = validHeaders + '\nBotanical Gardens,Australia,VIC,John Smith,Jane Doe,2024-01-15,true,false,true\nCity Park,Australia,NSW,Mary Johnson,John Smith,2024-02-01,false,true,false';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(2);
      expect(result.warnings).toHaveLength(0);

      // Check first event
      const event1 = result.events[0];
      expect(event1.prospectEvent).toBe('Botanical Gardens');
      expect(event1.country).toBe('Australia');
      expect(event1.state).toBe('VIC');
      expect(event1.prospectEDs).toBe('John Smith');
      expect(event1.eventAmbassador).toBe('Jane Doe');
      expect(event1.dateMadeContact).toEqual(new Date('2024-01-15'));
      expect(event1.courseFound).toBe(true);
      expect(event1.landownerPermission).toBe(false);
      expect(event1.fundingConfirmed).toBe(true);
      expect(event1.geocodingStatus).toBe('pending');
      expect(event1.ambassadorMatchStatus).toBe('pending');
      expect(typeof event1.id).toBe('string');
      expect(event1.sourceRow).toBe(2);
    });

    it('should handle missing optional date', () => {
      const csv = validHeaders + '\nPark,Australia,VIC,,Jane Doe,,true,true,true';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].dateMadeContact).toBeNull();
    });

    it('should allow empty EA field and mark as unmatched during import', () => {
      const csv = validHeaders + '\nPark,Australia,VIC,,,2024-01-15,true,false,true';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].eventAmbassador).toBe(''); // Empty EA field
      expect(result.events[0].ambassadorMatchStatus).toBe('pending');
    });

    it('should parse various boolean formats', () => {
      const csv = validHeaders + '\nPark1,Australia,VIC,,Jane,2024-01-15,true,true,true\nPark2,Australia,VIC,,Jane,2024-01-15,yes,no,1\nPark3,Australia,VIC,,Jane,2024-01-15,false,0,n\nPark4,Australia,VIC,,Jane,2024-01-15,t,f,y\nPark5,Australia,VIC,,Jane,2024-01-15,pending,,maybe';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(5);

      expect(result.events[0].courseFound).toBe(true);
      expect(result.events[0].landownerPermission).toBe(true);
      expect(result.events[0].fundingConfirmed).toBe(true);

      expect(result.events[1].courseFound).toBe(true);
      expect(result.events[1].landownerPermission).toBe(false);
      expect(result.events[1].fundingConfirmed).toBe(true);

      expect(result.events[2].courseFound).toBe(false);
      expect(result.events[2].landownerPermission).toBe(false);
      expect(result.events[2].fundingConfirmed).toBe(false);

      expect(result.events[3].courseFound).toBe(true);
      expect(result.events[3].landownerPermission).toBe(false);
      expect(result.events[3].fundingConfirmed).toBe(true);

      // Non-standard boolean values should be treated as false
      expect(result.events[4].courseFound).toBe(false); // "pending"
      expect(result.events[4].landownerPermission).toBe(false); // empty
      expect(result.events[4].fundingConfirmed).toBe(false); // "maybe"
    });

    it('should parse DD/MM/YY date format', () => {
      const csv = validHeaders + '\nPark1,Australia,VIC,,Jane,19/08/25,true,true,true\nPark2,Australia,VIC,,Jane,31/03/25,false,false,false\nPark3,Australia,VIC,,Jane,28/02/25,true,false,true';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(3);

      // Check that dates are parsed correctly (25 = 2025)
      expect(result.events[0].dateMadeContact).toEqual(new Date(2025, 7, 19)); // August 19, 2025
      expect(result.events[1].dateMadeContact).toEqual(new Date(2025, 2, 31)); // March 31, 2025
      expect(result.events[2].dateMadeContact).toEqual(new Date(2025, 1, 28)); // February 28, 2025
    });
  });

  describe('error handling', () => {
    it('should reject CSV with missing headers', () => {
      const csv = 'Prospect Event,Country,State\nBotanical Gardens,Australia,VIC';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Missing required header');
      expect(result.errors[0].row).toBe(0);
      expect(result.events).toHaveLength(0);
    });

    it('should reject CSV with no data rows', () => {
      const csv = validHeaders + '\n';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('at least a header row and one data row');
    });

    it('should reject rows with missing required fields', () => {
      const csv = validHeaders + '\n,Australia,VIC,John Smith,Jane Doe,2024-01-15,true,false,true';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Prospect Event name is required');
      expect(result.errors[0].row).toBe(2);
    });

    it('should reject invalid dates', () => {
      const csv = validHeaders + '\nPark,Australia,VIC,,Jane,invalid-date,true,true,true';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Invalid date format');
      expect(result.errors[0].row).toBe(2);
    });

    it('should reject dates too far in past/future', () => {
      const csv = validHeaders + '\nPark,Australia,VIC,,Jane,1800-01-01,true,true,true';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Date out of reasonable range');
      expect(result.errors[0].row).toBe(2);
    });

    it('should accept any boolean values and treat non-truthy as false', () => {
      const csv = validHeaders + '\nPark,Australia,VIC,,Jane,2024-01-15,maybe,true,true';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].courseFound).toBe(false); // "maybe" treated as false
      expect(result.events[0].landownerPermission).toBe(true);
      expect(result.events[0].fundingConfirmed).toBe(true);
    });

    it('should handle rows with wrong number of fields', () => {
      const csv = validHeaders + '\nBotanical Gardens,Australia,VIC,John Smith,Jane Doe,2024-01-15,true,false\nCity Park,Australia,NSW,Mary Johnson,John Smith,2024-02-01,false,true,false,true,extra';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].message).toContain('Expected 9 fields but got 8');
      expect(result.errors[0].row).toBe(2);
      expect(result.errors[1].message).toContain('Expected 9 fields but got 11');
      expect(result.errors[1].row).toBe(3);
      expect(result.events).toHaveLength(0);
    });

    it('should allow unexpected headers and ignore them', () => {
      const csvWithExtraHeaders = 'Prospect Event,Country,State,Prospect ED/s,EA,Date Made Contact,Course Found,Landowner Permission,Funding Confirmed,Edit,Notes,Extra Column\nBotanical Gardens,Australia,VIC,John Smith,Jane Doe,2024-01-15,true,false,true,Some notes,Additional data,More data';

      const result = parseProspectiveEventsCSV(csvWithExtraHeaders);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].prospectEvent).toBe('Botanical Gardens');
      expect(result.events[0].country).toBe('Australia');
      expect(result.events[0].state).toBe('VIC');
      expect(result.events[0].eventAmbassador).toBe('Jane Doe');
    });
  });

  describe('CSV parsing edge cases', () => {
    it('should handle quoted fields with commas', () => {
      const csv = validHeaders + '\n"Botanical, Gardens",Australia,VIC,"John, Smith","Jane, Doe",2024-01-15,true,false,true';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].prospectEvent).toBe('Botanical, Gardens');
      expect(result.events[0].prospectEDs).toBe('John, Smith');
      expect(result.events[0].eventAmbassador).toBe('Jane, Doe');
    });

    it('should handle escaped quotes in quoted fields', () => {
      const csv = validHeaders + '\n"Botanical ""Gardens""",Australia,VIC,John,Smith,2024-01-15,true,false,true';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].prospectEvent).toBe('Botanical "Gardens"');
    });

    it('should handle empty fields', () => {
      const csv = validHeaders + '\nPark,Australia,VIC,,Jane,,true,true,true';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].prospectEDs).toBe('');
      expect(result.events[0].dateMadeContact).toBeNull();
    });

    it('should generate unique IDs', () => {
      const csv = validHeaders + '\nPark,Australia,VIC,,Jane,2024-01-15,true,true,true\nPark,Australia,VIC,,Jane,2024-01-15,true,true,true';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(2);
      expect(result.events[0].id).not.toBe(result.events[1].id);
      expect(result.events[0].id).toMatch(/^park-australia-vic-\d+-[a-z0-9]+$/);
    });

    it('should handle multiline fields in quoted values', () => {
      const csv = `${validHeaders}
"Botanical Gardens
with multiple lines",Australia,VIC,"John Smith
with notes","Jane Doe
Event Ambassador",2024-01-15,true,false,true`;

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].prospectEvent).toBe('Botanical Gardens\nwith multiple lines');
      expect(result.events[0].prospectEDs).toBe('John Smith\nwith notes');
      expect(result.events[0].eventAmbassador).toBe('Jane Doe\nEvent Ambassador');
    });
  });

  describe('integration with validation', () => {
    it('should validate complete events', () => {
      const csv = validHeaders + '\nBotanical Gardens,Australia,VIC,John Smith,Jane Doe,2024-01-15,true,false,true';

      const result = parseProspectiveEventsCSV(csv);

      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(1);

      const event = result.events[0];
      expect(event.id).toBeDefined();
      expect(event.importTimestamp).toBeDefined();
      expect(typeof event.importTimestamp).toBe('number');
    });
  });
});