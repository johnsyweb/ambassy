/**
 * Coordinate handling according to CONSTITUTION.md
 * 
 * All coordinates are represented internally as named latitude/longitude pairs.
 * Conversion functions handle API-specific formats at boundaries.
 */

export interface Coordinate {
  latitude: number;   // Range: -90 to 90
  longitude: number; // Range: -180 to 180
}

/**
 * Validates that a coordinate is within valid ranges
 */
export function isValidCoordinate(coord: Coordinate): boolean {
  return (
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180 &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude)
  );
}

/**
 * Creates a Coordinate with validation
 * @throws Error if coordinates are invalid
 */
export function createCoordinate(latitude: number, longitude: number): Coordinate {
  const coord: Coordinate = { latitude, longitude };
  if (!isValidCoordinate(coord)) {
    throw new Error(`Invalid coordinate: latitude=${latitude}, longitude=${longitude}`);
  }
  return coord;
}

/**
 * Converts Coordinate to Leaflet's [latitude, longitude] array format
 */
export function toLeafletArray(coord: Coordinate): [number, number] {
  if (!isValidCoordinate(coord)) {
    throw new Error('Invalid coordinate for Leaflet conversion');
  }
  return [coord.latitude, coord.longitude];
}

/**
 * Converts from Leaflet's [latitude, longitude] array format
 */
export function fromLeafletArray([lat, lng]: [number, number]): Coordinate {
  return createCoordinate(lat, lng);
}

/**
 * Converts Coordinate to GeoJSON's [longitude, latitude] array format
 */
export function toGeoJSONArray(coord: Coordinate): [number, number] {
  if (!isValidCoordinate(coord)) {
    throw new Error('Invalid coordinate for GeoJSON conversion');
  }
  return [coord.longitude, coord.latitude];
}

/**
 * Converts from GeoJSON's [longitude, latitude] array format
 */
export function fromGeoJSONArray([lng, lat]: [number, number]): Coordinate {
  return createCoordinate(lat, lng);
}

/**
 * Formats coordinate for display as "32.30642° N 122.61458° W"
 */
export function formatCoordinate(coord: Coordinate): string {
  if (!isValidCoordinate(coord)) {
    return 'Invalid coordinate';
  }

  const latDir = coord.latitude >= 0 ? 'N' : 'S';
  const lngDir = coord.longitude >= 0 ? 'E' : 'W';
  const latAbs = Math.abs(coord.latitude).toFixed(5);
  const lngAbs = Math.abs(coord.longitude).toFixed(5);

  return `${latAbs}° ${latDir} ${lngAbs}° ${lngDir}`;
}

/**
 * Parses coordinate string in various formats
 * Supports:
 * - "32.30642° N 122.61458° W"
 * - "(-37.7939, 144.9306)"
 * - "-37.7939, 144.9306"
 * - "lat: -37.7939, lng: 144.9306"
 */
export function parseCoordinateString(str: string): Coordinate | null {
  if (!str || str.trim() === '' || str === 'N/A') {
    return null;
  }

  // Format: "32.30642° N 122.61458° W" or "32.30642°N 122.61458°W"
  const degreeMatch = str.match(/(\d+(?:\.\d+)?)°\s*([NS])\s*,?\s*(\d+(?:\.\d+)?)°\s*([EW])/);
  if (degreeMatch) {
    let lat = parseFloat(degreeMatch[1]);
    let lng = parseFloat(degreeMatch[3]);
    if (degreeMatch[2] === 'S') lat = -lat;
    if (degreeMatch[4] === 'W') lng = -lng;
    try {
      return createCoordinate(lat, lng);
    } catch {
      return null;
    }
  }

  // Format: "(-37.7939, 144.9306)" or "-37.7939, 144.9306"
  const parenMatch = str.match(/\(?\s*([^,]+)\s*,\s*([^)]+)\s*\)?/);
  if (parenMatch) {
    const lat = parseFloat(parenMatch[1].trim());
    const lng = parseFloat(parenMatch[2].trim());
    if (!isNaN(lat) && !isNaN(lng)) {
      try {
        return createCoordinate(lat, lng);
      } catch {
        return null;
      }
    }
  }

  // Format: "lat: -37.7939, lng: 144.9306" or "latitude: -37.7939, longitude: 144.9306"
  const namedMatch = str.match(/(?:lat|latitude):\s*([^,\s]+).*?(?:lng|longitude):\s*([^\s,]+)/i);
  if (namedMatch) {
    const lat = parseFloat(namedMatch[1].trim());
    const lng = parseFloat(namedMatch[2].trim());
    if (!isNaN(lat) && !isNaN(lng)) {
      try {
        return createCoordinate(lat, lng);
      } catch {
        return null;
      }
    }
  }

  return null;
}

/**
 * Converts Coordinate to Nominatim API format (named lat/lon)
 */
export function toNominatimFormat(coord: Coordinate): { lat: number; lon: number } {
  if (!isValidCoordinate(coord)) {
    throw new Error('Invalid coordinate for Nominatim conversion');
  }
  return { lat: coord.latitude, lon: coord.longitude };
}

/**
 * Converts from Nominatim API format (named lat/lon)
 */
export function fromNominatimFormat({ lat, lon }: { lat: number; lon: number }): Coordinate {
  return createCoordinate(lat, lon);
}

/**
 * Gets latitude value for calculations (internal use only)
 * For display, use formatCoordinate() instead
 */
export function getLatitude(coord: Coordinate): number {
  if (!isValidCoordinate(coord)) {
    throw new Error('Invalid coordinate');
  }
  return coord.latitude;
}

/**
 * Gets longitude value for calculations (internal use only)
 * For display, use formatCoordinate() instead
 */
export function getLongitude(coord: Coordinate): number {
  if (!isValidCoordinate(coord)) {
    throw new Error('Invalid coordinate');
  }
  return coord.longitude;
}
