import {
  clearPlaceGeocodingCache,
  searchPlaces,
} from "./geocoding";

describe("searchPlaces", () => {
  beforeEach(() => {
    clearPlaceGeocodingCache();
    global.fetch = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns an empty list when the query is shorter than the minimum length", async () => {
    await expect(searchPlaces("ba")).resolves.toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns place suggestions from Photon", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            geometry: { coordinates: [143.8503, -37.5622] },
            properties: {
              name: "Ballarat",
              state: "Victoria",
              country: "Australia",
            },
          },
        ],
      }),
    });

    const resultPromise = searchPlaces("Ballarat");
    jest.runAllTimersAsync();
    await expect(resultPromise).resolves.toEqual([
      {
        label: "Ballarat, Victoria, Australia",
        latitude: -37.5622,
        longitude: 143.8503,
      },
    ]);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("photon.komoot.io/api/?q=Ballarat&limit=5"),
    );
  });
});
