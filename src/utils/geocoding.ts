/**
 * Geocoding utilities for converting addresses to coordinates
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
}

/**
 * Geocodes an address to latitude and longitude coordinates
 * Uses browser Geolocation API if available, falls back to Nominatim
 */
export async function geocodeAddress(address: string): Promise<{lat: number, lng: number}> {
  if (!address || address.trim().length === 0) {
    throw new Error('Address cannot be empty');
  }

  // Try browser geolocation first if address looks like coordinates
  if (isCoordinateFormat(address.trim())) {
    const coords = parseCoordinates(address.trim());
    if (coords) {
      return coords;
    }
  }

  // Fall back to Nominatim geocoding service
  try {
    const response = await fetch(
      `${NOMINATIM_URL}?q=${encodeURIComponent(address)}&format=json&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Geocoding service returned ${response.status}`);
    }

    const data: GeocodingResult[] = await response.json();

    if (data.length === 0) {
      throw new Error('No geocoding results found for address');
    }

    const result = data[0];
    const lat = typeof result.lat === 'string' ? parseFloat(result.lat) : result.lat;
    const lng = typeof result.lng === 'string' ? parseFloat(result.lng) : result.lng;

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid coordinates returned from geocoding service');
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Coordinates out of valid range');
    }

    return { lat, lng };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Geocoding failed: ${error.message}`);
    }
    throw new Error('Geocoding failed: Unknown error');
  }
}

/**
 * Checks if a string looks like coordinate input (lat,lng format)
 */
function isCoordinateFormat(input: string): boolean {
  const coordPattern = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
  return coordPattern.test(input);
}

/**
 * Parses coordinate string in "lat,lng" format
 */
function parseCoordinates(input: string): {lat: number, lng: number} | null {
  const parts = input.split(',').map(part => parseFloat(part.trim()));

  if (parts.length !== 2 || parts.some(isNaN)) {
    return null;
  }

  const [lat, lng] = parts;

  // Validate ranges
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
}