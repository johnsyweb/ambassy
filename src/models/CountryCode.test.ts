/**
 * Country Code Type Tests
 */

import {
  CountryCode,
  isValidCountryCode,
  isCountryCode,
  toCountryCode,
  tryCountryCode,
  extractCountryCodeFromUrl,
} from './CountryCode';

describe('CountryCode', () => {
  describe('isValidCountryCode', () => {
    it('should return true for valid country codes', () => {
      expect(isValidCountryCode('au')).toBe(true);
      expect(isValidCountryCode('uk')).toBe(true);
      expect(isValidCountryCode('us')).toBe(true);
      expect(isValidCountryCode('za')).toBe(true);
    });

    it('should return false for invalid country codes', () => {
      expect(isValidCountryCode('xx')).toBe(false);
      expect(isValidCountryCode('AU')).toBe(false); // Case sensitive
      expect(isValidCountryCode('')).toBe(false);
      expect(isValidCountryCode('aus')).toBe(false); // Too long
      expect(isValidCountryCode('a')).toBe(false); // Too short
    });
  });

  describe('isCountryCode', () => {
    it('should return true for valid CountryCode strings', () => {
      expect(isCountryCode('au')).toBe(true);
      expect(isCountryCode('uk')).toBe(true);
    });

    it('should return false for non-strings', () => {
      expect(isCountryCode(123)).toBe(false);
      expect(isCountryCode(null)).toBe(false);
      expect(isCountryCode(undefined)).toBe(false);
      expect(isCountryCode({})).toBe(false);
    });

    it('should return false for invalid strings', () => {
      expect(isCountryCode('xx')).toBe(false);
      expect(isCountryCode('AU')).toBe(false);
    });
  });

  describe('toCountryCode', () => {
    it('should return CountryCode for valid codes', () => {
      expect(toCountryCode('au')).toBe('au');
      expect(toCountryCode('uk')).toBe('uk');
    });

    it('should throw error for invalid codes', () => {
      expect(() => toCountryCode('xx')).toThrow('Invalid country code');
      expect(() => toCountryCode('AU')).toThrow('Invalid country code');
      expect(() => toCountryCode('')).toThrow('Invalid country code');
    });
  });

  describe('tryCountryCode', () => {
    it('should return CountryCode for valid codes', () => {
      expect(tryCountryCode('au')).toBe('au');
      expect(tryCountryCode('uk')).toBe('uk');
    });

    it('should return null for invalid codes', () => {
      expect(tryCountryCode('xx')).toBeNull();
      expect(tryCountryCode('AU')).toBeNull();
      expect(tryCountryCode('')).toBeNull();
    });
  });

  describe('extractCountryCodeFromUrl', () => {
    it('should extract country code from parkrun URLs', () => {
      expect(extractCountryCodeFromUrl('www.parkrun.com.au')).toBe('au');
      expect(extractCountryCodeFromUrl('www.parkrun.co.za')).toBe('za');
      expect(extractCountryCodeFromUrl('www.parkrun.co.uk')).toBe('uk');
      expect(extractCountryCodeFromUrl('www.parkrun.ca')).toBe('ca');
    });

    it('should handle URLs without www.parkrun. prefix', () => {
      expect(extractCountryCodeFromUrl('com.au')).toBe('au');
      expect(extractCountryCodeFromUrl('co.za')).toBe('za');
    });

    it('should return null for invalid URLs', () => {
      expect(extractCountryCodeFromUrl('www.parkrun.xx')).toBeNull();
      expect(extractCountryCodeFromUrl('invalid-url')).toBeNull();
      expect(extractCountryCodeFromUrl('')).toBeNull();
    });

    it('should handle multi-part domains correctly', () => {
      expect(extractCountryCodeFromUrl('www.parkrun.com.au')).toBe('au');
      expect(extractCountryCodeFromUrl('www.parkrun.co.za')).toBe('za');
    });
  });

  describe('Type safety', () => {
    it('should enforce CountryCode type in assignments', () => {
      const code: CountryCode = 'au';
      expect(code).toBe('au');
      
      // TypeScript should prevent this at compile time:
      // const invalid: CountryCode = 'xx'; // Should cause type error
    });
  });
});
