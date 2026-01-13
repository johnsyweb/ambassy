/**
 * Comprehensive unit tests for Coordinate type and conversion functions
 * 
 * Coordinate is the ONLY place in the application that validates coordinate pairs.
 */

import {
  Coordinate,
  createCoordinate,
  isValidCoordinate,
  toLeafletArray,
  fromLeafletArray,
  toGeoJSONArray,
  fromGeoJSONArray,
  formatCoordinate,
  parseCoordinateString,
  toNominatimFormat,
  fromNominatimFormat
} from './Coordinate';

describe('Coordinate', () => {
  describe('createCoordinate', () => {
    it('should create a valid coordinate', () => {
      const coord = createCoordinate(-37.8136, 144.9631);
      expect(coord.latitude).toBe(-37.8136);
      expect(coord.longitude).toBe(144.9631);
    });

    it('should throw error for invalid latitude (too low)', () => {
      expect(() => createCoordinate(-91, 0)).toThrow('Invalid coordinate');
    });

    it('should throw error for invalid latitude (too high)', () => {
      expect(() => createCoordinate(91, 0)).toThrow('Invalid coordinate');
    });

    it('should throw error for invalid longitude (too low)', () => {
      expect(() => createCoordinate(0, -181)).toThrow('Invalid coordinate');
    });

    it('should throw error for invalid longitude (too high)', () => {
      expect(() => createCoordinate(0, 181)).toThrow('Invalid coordinate');
    });

    it('should throw error for NaN latitude', () => {
      expect(() => createCoordinate(NaN, 0)).toThrow('Invalid coordinate');
    });

    it('should throw error for NaN longitude', () => {
      expect(() => createCoordinate(0, NaN)).toThrow('Invalid coordinate');
    });

    it('should accept boundary values', () => {
      expect(() => createCoordinate(-90, -180)).not.toThrow();
      expect(() => createCoordinate(90, 180)).not.toThrow();
      expect(() => createCoordinate(0, 0)).not.toThrow();
    });

    it('should accept all valid ranges', () => {
      expect(() => createCoordinate(-89.999, -179.999)).not.toThrow();
      expect(() => createCoordinate(89.999, 179.999)).not.toThrow();
    });
  });

  describe('isValidCoordinate', () => {
    it('should return true for valid coordinates', () => {
      expect(isValidCoordinate({ latitude: -37.8136, longitude: 144.9631 })).toBe(true);
      expect(isValidCoordinate({ latitude: 0, longitude: 0 })).toBe(true);
      expect(isValidCoordinate({ latitude: -90, longitude: -180 })).toBe(true);
      expect(isValidCoordinate({ latitude: 90, longitude: 180 })).toBe(true);
    });

    it('should return false for invalid latitude (too low)', () => {
      expect(isValidCoordinate({ latitude: -91, longitude: 0 })).toBe(false);
    });

    it('should return false for invalid latitude (too high)', () => {
      expect(isValidCoordinate({ latitude: 91, longitude: 0 })).toBe(false);
    });

    it('should return false for invalid longitude (too low)', () => {
      expect(isValidCoordinate({ latitude: 0, longitude: -181 })).toBe(false);
    });

    it('should return false for invalid longitude (too high)', () => {
      expect(isValidCoordinate({ latitude: 0, longitude: 181 })).toBe(false);
    });

    it('should return false for NaN values', () => {
      expect(isValidCoordinate({ latitude: NaN, longitude: 0 })).toBe(false);
      expect(isValidCoordinate({ latitude: 0, longitude: NaN })).toBe(false);
      expect(isValidCoordinate({ latitude: NaN, longitude: NaN })).toBe(false);
    });

    it('should return false for non-number values', () => {
      expect(isValidCoordinate({ latitude: 'invalid' as any, longitude: 0 })).toBe(false);
      expect(isValidCoordinate({ latitude: 0, longitude: 'invalid' as any })).toBe(false);
    });
  });

  describe('toLeafletArray / fromLeafletArray', () => {
    it('should convert to Leaflet format [latitude, longitude]', () => {
      const coord = createCoordinate(-37.8136, 144.9631);
      const leaflet = toLeafletArray(coord);
      expect(leaflet).toEqual([-37.8136, 144.9631]);
      expect(leaflet[0]).toBe(coord.latitude);
      expect(leaflet[1]).toBe(coord.longitude);
    });

    it('should convert from Leaflet format [latitude, longitude]', () => {
      const leaflet: [number, number] = [-37.8136, 144.9631];
      const coord = fromLeafletArray(leaflet);
      expect(coord.latitude).toBe(-37.8136);
      expect(coord.longitude).toBe(144.9631);
    });

    it('should round-trip correctly', () => {
      const original = createCoordinate(-37.8136, 144.9631);
      const leaflet = toLeafletArray(original);
      const restored = fromLeafletArray(leaflet);
      expect(restored).toEqual(original);
    });

    it('should throw error for invalid coordinate when converting to Leaflet', () => {
      const invalid = { latitude: 91, longitude: 0 };
      expect(() => toLeafletArray(invalid as Coordinate)).toThrow('Invalid coordinate');
    });

    it('should validate when converting from Leaflet array', () => {
      expect(() => fromLeafletArray([91, 0])).toThrow('Invalid coordinate');
      expect(() => fromLeafletArray([0, 181])).toThrow('Invalid coordinate');
    });
  });

  describe('toGeoJSONArray / fromGeoJSONArray', () => {
    it('should convert to GeoJSON format [longitude, latitude]', () => {
      const coord = createCoordinate(-37.8136, 144.9631);
      const geoJSON = toGeoJSONArray(coord);
      expect(geoJSON).toEqual([144.9631, -37.8136]);
      expect(geoJSON[0]).toBe(coord.longitude);
      expect(geoJSON[1]).toBe(coord.latitude);
    });

    it('should convert from GeoJSON format [longitude, latitude]', () => {
      const geoJSON: [number, number] = [144.9631, -37.8136];
      const coord = fromGeoJSONArray(geoJSON);
      expect(coord.latitude).toBe(-37.8136);
      expect(coord.longitude).toBe(144.9631);
    });

    it('should round-trip correctly', () => {
      const original = createCoordinate(-37.8136, 144.9631);
      const geoJSON = toGeoJSONArray(original);
      const restored = fromGeoJSONArray(geoJSON);
      expect(restored).toEqual(original);
    });

    it('should throw error for invalid coordinate when converting to GeoJSON', () => {
      const invalid = { latitude: 91, longitude: 0 };
      expect(() => toGeoJSONArray(invalid as Coordinate)).toThrow('Invalid coordinate');
    });

    it('should validate when converting from GeoJSON array', () => {
      expect(() => fromGeoJSONArray([0, 91])).toThrow('Invalid coordinate');
      expect(() => fromGeoJSONArray([181, 0])).toThrow('Invalid coordinate');
    });
  });

  describe('toNominatimFormat / fromNominatimFormat', () => {
    it('should convert to Nominatim format {lat, lon}', () => {
      const coord = createCoordinate(-37.8136, 144.9631);
      const nominatim = toNominatimFormat(coord);
      expect(nominatim).toEqual({ lat: -37.8136, lon: 144.9631 });
      expect(nominatim.lat).toBe(coord.latitude);
      expect(nominatim.lon).toBe(coord.longitude);
    });

    it('should convert from Nominatim format {lat, lon}', () => {
      const nominatim = { lat: -37.8136, lon: 144.9631 };
      const coord = fromNominatimFormat(nominatim);
      expect(coord.latitude).toBe(-37.8136);
      expect(coord.longitude).toBe(144.9631);
    });

    it('should round-trip correctly', () => {
      const original = createCoordinate(-37.8136, 144.9631);
      const nominatim = toNominatimFormat(original);
      const restored = fromNominatimFormat(nominatim);
      expect(restored).toEqual(original);
    });

    it('should throw error for invalid coordinate when converting to Nominatim', () => {
      const invalid = { latitude: 91, longitude: 0 };
      expect(() => toNominatimFormat(invalid as Coordinate)).toThrow('Invalid coordinate');
    });

    it('should validate when converting from Nominatim format', () => {
      expect(() => fromNominatimFormat({ lat: 91, lon: 0 })).toThrow('Invalid coordinate');
      expect(() => fromNominatimFormat({ lat: 0, lon: 181 })).toThrow('Invalid coordinate');
    });
  });

  describe('formatCoordinate', () => {
    it('should format positive coordinates correctly', () => {
      const coord = createCoordinate(32.30642, 122.61458);
      const formatted = formatCoordinate(coord);
      expect(formatted).toBe('32.30642° N 122.61458° E');
    });

    it('should format negative coordinates correctly', () => {
      const coord = createCoordinate(-37.8136, -144.9631);
      const formatted = formatCoordinate(coord);
      expect(formatted).toBe('37.81360° S 144.96310° W');
    });

    it('should format zero coordinates correctly', () => {
      const coord = createCoordinate(0, 0);
      const formatted = formatCoordinate(coord);
      expect(formatted).toBe('0.00000° N 0.00000° E');
    });

    it('should format with 5 decimal places', () => {
      const coord = createCoordinate(-37.8136123, 144.9631456);
      const formatted = formatCoordinate(coord);
      expect(formatted).toBe('37.81361° S 144.96315° E');
    });

    it('should return error message for invalid coordinate', () => {
      const invalid = { latitude: 91, longitude: 0 };
      const formatted = formatCoordinate(invalid as Coordinate);
      expect(formatted).toBe('Invalid coordinate');
    });
  });

  describe('parseCoordinateString', () => {
    it('should parse degree format "32.30642° N 122.61458° E"', () => {
      const coord = parseCoordinateString('32.30642° N 122.61458° E');
      expect(coord).not.toBeNull();
      expect(coord!.latitude).toBe(32.30642);
      expect(coord!.longitude).toBe(122.61458);
    });

    it('should parse degree format with negative coordinates', () => {
      const coord = parseCoordinateString('37.81360° S 144.96310° W');
      expect(coord).not.toBeNull();
      expect(coord!.latitude).toBe(-37.81360);
      expect(coord!.longitude).toBe(-144.96310);
    });

    it('should parse parenthesized format "(-37.8136, 144.9631)"', () => {
      const coord = parseCoordinateString('(-37.8136, 144.9631)');
      expect(coord).not.toBeNull();
      expect(coord!.latitude).toBe(-37.8136);
      expect(coord!.longitude).toBe(144.9631);
    });

    it('should parse simple comma format "-37.8136, 144.9631"', () => {
      const coord = parseCoordinateString('-37.8136, 144.9631');
      expect(coord).not.toBeNull();
      expect(coord!.latitude).toBe(-37.8136);
      expect(coord!.longitude).toBe(144.9631);
    });

    it('should parse named format "lat: -37.8136, lng: 144.9631"', () => {
      const coord = parseCoordinateString('lat: -37.8136, lng: 144.9631');
      expect(coord).not.toBeNull();
      expect(coord!.latitude).toBe(-37.8136);
      expect(coord!.longitude).toBe(144.9631);
    });

    it('should parse named format with "latitude" and "longitude"', () => {
      const coord = parseCoordinateString('latitude: -37.8136, longitude: 144.9631');
      expect(coord).not.toBeNull();
      expect(coord!.latitude).toBe(-37.8136);
      expect(coord!.longitude).toBe(144.9631);
    });

    it('should handle whitespace variations', () => {
      expect(parseCoordinateString('  -37.8136  ,  144.9631  ')).not.toBeNull();
      expect(parseCoordinateString('( -37.8136 , 144.9631 )')).not.toBeNull();
      expect(parseCoordinateString('32.30642°N,122.61458°E')).not.toBeNull();
    });

    it('should return null for invalid formats', () => {
      expect(parseCoordinateString('')).toBeNull();
      expect(parseCoordinateString('N/A')).toBeNull();
      expect(parseCoordinateString('invalid')).toBeNull();
      expect(parseCoordinateString('37.8136')).toBeNull(); // Missing longitude
      expect(parseCoordinateString('37.8136,')).toBeNull(); // Incomplete
    });

    it('should return null for out-of-range coordinates', () => {
      expect(parseCoordinateString('91, 0')).toBeNull(); // Latitude too high
      expect(parseCoordinateString('-91, 0')).toBeNull(); // Latitude too low
      expect(parseCoordinateString('0, 181')).toBeNull(); // Longitude too high
      expect(parseCoordinateString('0, -181')).toBeNull(); // Longitude too low
    });

    it('should return null for non-numeric values', () => {
      expect(parseCoordinateString('abc, def')).toBeNull();
      expect(parseCoordinateString('37.8136, abc')).toBeNull();
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle extreme but valid coordinates', () => {
      const northPole = createCoordinate(90, 0);
      expect(isValidCoordinate(northPole)).toBe(true);

      const southPole = createCoordinate(-90, 0);
      expect(isValidCoordinate(southPole)).toBe(true);

      const dateLine = createCoordinate(0, 180);
      expect(isValidCoordinate(dateLine)).toBe(true);

      const antiMeridian = createCoordinate(0, -180);
      expect(isValidCoordinate(antiMeridian)).toBe(true);
    });

    it('should handle precision edge cases', () => {
      const coord = createCoordinate(0.00001, 0.00001);
      expect(isValidCoordinate(coord)).toBe(true);
      
      const formatted = formatCoordinate(coord);
      expect(formatted).toContain('0.00001');
    });

    it('should handle very small negative values', () => {
      const coord = createCoordinate(-0.00001, -0.00001);
      expect(isValidCoordinate(coord)).toBe(true);
    });
  });

  describe('Type safety', () => {
    it('should enforce Coordinate interface structure', () => {
      const coord: Coordinate = { latitude: -37.8136, longitude: 144.9631 };
      expect(coord.latitude).toBeDefined();
      expect(coord.longitude).toBeDefined();
    });

    it('should reject objects missing required properties', () => {
      expect(isValidCoordinate({ latitude: -37.8136 } as any)).toBe(false);
      expect(isValidCoordinate({ longitude: 144.9631 } as any)).toBe(false);
      expect(isValidCoordinate({} as any)).toBe(false);
    });
  });
});
