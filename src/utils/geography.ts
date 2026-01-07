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

