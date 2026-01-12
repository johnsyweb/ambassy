/**
 * Calculate the distance between two points on Earth using the Haversine formula.
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometres
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometres
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians.
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the average distance from a point to multiple other points.
 * @param lat Latitude of reference point in degrees
 * @param lon Longitude of reference point in degrees
 * @param points Array of [latitude, longitude] pairs in degrees
 * @returns Average distance in kilometres, or null if points array is empty
 */
export function calculateAverageDistance(
  lat: number,
  lon: number,
  points: Array<[number, number]>
): number | null {
  if (points.length === 0) {
    return null;
  }

  const distances = points.map(([pointLat, pointLon]) =>
    calculateDistance(lat, lon, pointLat, pointLon)
  );

  const sum = distances.reduce((acc, dist) => acc + dist, 0);
  return sum / distances.length;
}

/**
 * Geocode an address using Nominatim API
 */
export async function geocodeAddress(
  address: string
): Promise<{
  success: boolean;
  coordinates?: [number, number];
  error?: string;
}> {
  try {
    const encodedQuery = encodeURIComponent(address);

    // Use Nominatim API for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
      {
        headers: {
          'User-Agent': 'Ambassy-Prospective-Events/1.0'
        }
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `Geocoding service returned ${response.status}`
      };
    }

    const results = await response.json();

    if (results.length === 0) {
      return {
        success: false,
        error: `No location found for "${address}"`
      };
    }

    const result = results[0];
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return {
        success: false,
        error: 'Invalid coordinates returned from geocoding service'
      };
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return {
        success: false,
        error: 'Coordinates out of valid range'
      };
    }

    return {
      success: true,
      coordinates: [lat, lon]
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Geocoding request failed'
    };
  }
}

/**
 * Geocode a prospective event using country and state
 */
export async function geocodeProspectiveEvent(
  country: string,
  state: string
): Promise<{
  success: boolean;
  coordinates?: [number, number];
  error?: string;
}> {
  try {
    // Create a search query from country and state
    const query = `${state}, ${country}`;
    const encodedQuery = encodeURIComponent(query);

    // Use Nominatim API for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
      {
        headers: {
          'User-Agent': 'Ambassy-Prospective-Events/1.0'
        }
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `Geocoding service returned ${response.status}`
      };
    }

    const results = await response.json();

    if (results.length === 0) {
      return {
        success: false,
        error: `No location found for "${query}"`
      };
    }

    const result = results[0];
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return {
        success: false,
        error: 'Invalid coordinates returned from geocoding service'
      };
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return {
        success: false,
        error: 'Coordinates out of valid range'
      };
    }

    return {
      success: true,
      coordinates: [lat, lon]
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Geocoding request failed'
    };
  }
}
