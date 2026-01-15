import { buildEventHistoryUrl } from './eventHistoryUrl';
import { CountryMap } from "@models/country";

describe('buildEventHistoryUrl', () => {
  const countries: CountryMap = {
    '3': { url: 'www.parkrun.com.au', bounds: [113.0, -44.0, 154.0, -10.0] },
    '1': { url: 'www.parkrun.co.uk', bounds: [-8.0, 49.0, 2.0, 61.0] },
    '2': { url: 'www.parkrun.ca', bounds: [-141.0, 41.0, -52.0, 84.0] },
  };

  describe('with valid inputs', () => {
    it('should construct URL for Australian event', () => {
      const url = buildEventHistoryUrl('albertmelbourne', 3, countries);
      expect(url).toBe('https://www.parkrun.com.au/albertmelbourne/results/eventhistory/');
    });

    it('should construct URL for UK event', () => {
      const url = buildEventHistoryUrl('bushy', 1, countries);
      expect(url).toBe('https://www.parkrun.co.uk/bushy/results/eventhistory/');
    });

    it('should construct URL for Canadian event', () => {
      const url = buildEventHistoryUrl('toronto', 2, countries);
      expect(url).toBe('https://www.parkrun.ca/toronto/results/eventhistory/');
    });
  });

  describe('with different country codes', () => {
    it('should handle country code as string key lookup', () => {
      const url = buildEventHistoryUrl('testevent', 3, countries);
      expect(url).toBe('https://www.parkrun.com.au/testevent/results/eventhistory/');
    });

    it('should work with single digit country codes', () => {
      const url = buildEventHistoryUrl('testevent', 1, countries);
      expect(url).toBe('https://www.parkrun.co.uk/testevent/results/eventhistory/');
    });
  });

  describe('with missing country code', () => {
    it('should return null when country code not in countries map', () => {
      const url = buildEventHistoryUrl('testevent', 99, countries);
      expect(url).toBeNull();
    });

    it('should return null when country code is 0', () => {
      const url = buildEventHistoryUrl('testevent', 0, countries);
      expect(url).toBeNull();
    });
  });

  describe('with null country.url', () => {
    it('should return null when country.url is null', () => {
      const countriesWithNull: CountryMap = {
        '5': { url: null, bounds: [0, 0, 0, 0] },
      };
      const url = buildEventHistoryUrl('testevent', 5, countriesWithNull);
      expect(url).toBeNull();
    });
  });

  describe('with missing EventDetails', () => {
    it('should return null when eventShortName is empty', () => {
      const url = buildEventHistoryUrl('', 3, countries);
      expect(url).toBeNull();
    });

    it('should return null when eventShortName is whitespace only', () => {
      const url = buildEventHistoryUrl('   ', 3, countries);
      expect(url).toBeNull();
    });
  });
});
