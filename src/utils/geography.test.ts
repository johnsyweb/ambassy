import { calculateDistance, calculateAverageDistance } from "./geography";

describe("geography", () => {
  describe("calculateDistance", () => {
    it("should calculate distance between two points using Haversine formula", () => {
      // Melbourne to Sydney: approximately 713 km
      const melbourneLat = -37.8136;
      const melbourneLon = 144.9631;
      const sydneyLat = -33.8688;
      const sydneyLon = 151.2093;

      const distance = calculateDistance(melbourneLat, melbourneLon, sydneyLat, sydneyLon);
      
      // Allow 50km tolerance for Haversine calculation
      expect(distance).toBeGreaterThan(660);
      expect(distance).toBeLessThan(760);
    });

    it("should return 0 for same point", () => {
      const lat = -37.8136;
      const lon = 144.9631;
      const distance = calculateDistance(lat, lon, lat, lon);
      expect(distance).toBe(0);
    });

    it("should handle negative coordinates (southern/western hemisphere)", () => {
      const lat1 = -37.8136;
      const lon1 = 144.9631;
      const lat2 = -38.0;
      const lon2 = 145.0;

      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(100);
    });

    it("should calculate distance correctly for nearby points", () => {
      // Two points approximately 1 degree apart (roughly 111 km at equator)
      const lat1 = -37.8136;
      const lon1 = 144.9631;
      const lat2 = -37.8136;
      const lon2 = 145.9631; // 1 degree longitude difference

      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      // At Melbourne's latitude, 1 degree longitude is approximately 88 km
      expect(distance).toBeGreaterThan(80);
      expect(distance).toBeLessThan(95);
    });
  });

  describe("calculateAverageDistance", () => {
    it("should calculate average distance from point to multiple points", () => {
      const referenceLat = -37.8136;
      const referenceLon = 144.9631;
      const points: Array<[number, number]> = [
        [-37.8, 144.96], // ~1 km away
        [-37.9, 144.97], // ~12 km away
        [-37.7, 144.95], // ~15 km away
      ];

      const avgDistance = calculateAverageDistance(referenceLat, referenceLon, points);
      
      expect(avgDistance).not.toBeNull();
      expect(avgDistance).toBeGreaterThan(5);
      expect(avgDistance).toBeLessThan(20);
    });

    it("should return null for empty points array", () => {
      const referenceLat = -37.8136;
      const referenceLon = 144.9631;
      const points: Array<[number, number]> = [];

      const avgDistance = calculateAverageDistance(referenceLat, referenceLon, points);
      expect(avgDistance).toBeNull();
    });

    it("should return correct distance for single point", () => {
      const referenceLat = -37.8136;
      const referenceLon = 144.9631;
      const points: Array<[number, number]> = [[-37.8, 144.96]];

      const avgDistance = calculateAverageDistance(referenceLat, referenceLon, points);
      
      expect(avgDistance).not.toBeNull();
      const singleDistance = calculateDistance(referenceLat, referenceLon, -37.8, 144.96);
      expect(avgDistance).toBeCloseTo(singleDistance, 1);
    });
  });
});

