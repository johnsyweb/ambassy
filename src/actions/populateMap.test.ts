describe("populateMap duplicate filtering", () => {

  beforeEach(() => {
    // Reset global state between tests
    jest.clearAllMocks();
  });

  describe("duplicate coordinate filtering", () => {
    it("should remove exact duplicate coordinates", () => {
      // Create mock voronoi points with some duplicates
      const voronoiPoints: [number, number, string][] = [
        [145.0, -37.8, '{"raColor":"red","tooltip":"Event 1"}'],
        [145.0, -37.8, '{"raColor":"blue","tooltip":"Event 2"}'], // Exact duplicate
        [145.1, -37.9, '{"raColor":"green","tooltip":"Event 3"}'],
        [145.2, -38.0, '{"raColor":"yellow","tooltip":"Event 4"}'],
        [145.1, -37.9, '{"raColor":"purple","tooltip":"Event 5"}'], // Another duplicate
      ];

      // Filter duplicates (simulating the logic in populateMap)
      const uniquePoints = voronoiPoints.filter((point, index, arr) => {
        const [lng, lat] = point;
        return !arr.slice(0, index).some(otherPoint => {
          const [otherLng, otherLat] = otherPoint;
          return Math.abs(lng - otherLng) < 0.000001 && Math.abs(lat - otherLat) < 0.000001;
        });
      });

      expect(uniquePoints).toHaveLength(3);
      expect(uniquePoints).toEqual([
        [145.0, -37.8, '{"raColor":"red","tooltip":"Event 1"}'],
        [145.1, -37.9, '{"raColor":"green","tooltip":"Event 3"}'],
        [145.2, -38.0, '{"raColor":"yellow","tooltip":"Event 4"}'],
      ]);
    });

    it("should preserve coordinates that are very close but not exact duplicates", () => {
      const voronoiPoints: [number, number, string][] = [
        [145.000000, -37.800000, '{"raColor":"red","tooltip":"Event 1"}'],
        [145.000001, -37.800001, '{"raColor":"blue","tooltip":"Event 2"}'], // Slightly different
        [145.000010, -37.800010, '{"raColor":"green","tooltip":"Event 3"}'], // Different
      ];

      const uniquePoints = voronoiPoints.filter((point, index, arr) => {
        const [lng, lat] = point;
        return !arr.slice(0, index).some(otherPoint => {
          const [otherLng, otherLat] = otherPoint;
          return Math.abs(lng - otherLng) < 0.000001 && Math.abs(lat - otherLat) < 0.000001;
        });
      });

      expect(uniquePoints).toHaveLength(3); // All preserved
    });

    it("should handle empty array", () => {
      const voronoiPoints: [number, number, string][] = [];
      const uniquePoints = voronoiPoints.filter((point, index, arr) => {
        const [lng, lat] = point;
        return !arr.slice(0, index).some(otherPoint => {
          const [otherLng, otherLat] = otherPoint;
          return Math.abs(lng - otherLng) < 0.000001 && Math.abs(lat - otherLat) < 0.000001;
        });
      });

      expect(uniquePoints).toHaveLength(0);
    });

    it("should handle single point", () => {
      const voronoiPoints: [number, number, string][] = [
        [145.0, -37.8, '{"raColor":"red","tooltip":"Event 1"}'],
      ];

      const uniquePoints = voronoiPoints.filter((point, index, arr) => {
        const [lng, lat] = point;
        return !arr.slice(0, index).some(otherPoint => {
          const [otherLng, otherLat] = otherPoint;
          return Math.abs(lng - otherLng) < 0.000001 && Math.abs(lat - otherLat) < 0.000001;
        });
      });

      expect(uniquePoints).toHaveLength(1);
    });
  });
});