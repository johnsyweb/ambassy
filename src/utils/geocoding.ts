/**
 * Geocoding utilities for converting addresses to coordinates
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export interface GeocodingResult {
  lat: number | string;
  lon: number | string;
  lng?: number | string;
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

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No geocoding results found for address');
    }

    const result = data[0];

    // Handle different possible coordinate formats from Nominatim
    let lat: number;
    let lng: number;

    if (typeof result.lat === 'string') {
      lat = parseFloat(result.lat);
    } else if (typeof result.lat === 'number') {
      lat = result.lat;
    } else {
      throw new Error('Invalid latitude format in geocoding response');
    }

    if (typeof result.lon === 'string') {
      lng = parseFloat(result.lon);
    } else if (typeof result.lon === 'number') {
      lng = result.lon;
    } else if (typeof result.lng === 'string') {
      lng = parseFloat(result.lng);
    } else if (typeof result.lng === 'number') {
      lng = result.lng;
    } else {
      throw new Error('Invalid longitude format in geocoding response');
    }

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error(`Invalid coordinates: lat=${lat}, lng=${lng}`);
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error(`Coordinates out of valid range: lat=${lat}, lng=${lng}`);
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