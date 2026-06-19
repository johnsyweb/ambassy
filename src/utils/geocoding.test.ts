import {
  clearPlaceGeocodingCache,
  geocodeAddress,
  normalizePlaceSearchQuery,
  PlaceGeocodingUnavailableError,
  searchPlaces,
  MIN_PHOTON_REQUEST_INTERVAL_MS,
} from "./geocoding";

describe("geocoding", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    clearPlaceGeocodingCache();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const photonFeature = (
    name: string,
    latitude: number,
    longitude: number,
  ) => ({
    geometry: { coordinates: [longitude, latitude] },
    properties: { name, country: "Australia" },
  });

  async function runQueuedSearch(query: string) {
    const resultPromise = searchPlaces(query);
    await jest.runAllTimersAsync();
    return resultPromise;
  }

  it("normalises place search queries for cache keys", () => {
    expect(normalizePlaceSearchQuery("  Ballarat   VIC ")).toBe(
      "ballarat vic",
    );
  });

  it("returns cached results without a second network request", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [photonFeature("Ballarat", -37.5622, 143.8503)],
      }),
    });

    await runQueuedSearch("Ballarat");
    await runQueuedSearch("  ballarat  ");

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("queues Photon requests at least one second apart", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ features: [] }),
    });

    const first = runQueuedSearch("Melbourne");
    await jest.advanceTimersByTimeAsync(MIN_PHOTON_REQUEST_INTERVAL_MS);
    const second = runQueuedSearch("Sydney");
    await jest.runAllTimersAsync();

    await Promise.all([first, second]);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("throws PlaceGeocodingUnavailableError on HTTP 429", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
    });

    const resultPromise = searchPlaces("Ballarat");
    const expectation = expect(resultPromise).rejects.toBeInstanceOf(
      PlaceGeocodingUnavailableError,
    );
    await jest.runAllTimersAsync();
    await expectation;
  });

  it("does not cache unavailable errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
    });

    const firstPromise = searchPlaces("Ballarat");
    const firstExpectation = expect(firstPromise).rejects.toThrow();
    await jest.runAllTimersAsync();
    await firstExpectation;

    const secondPromise = searchPlaces("Ballarat");
    const secondExpectation = expect(secondPromise).rejects.toThrow();
    await jest.runAllTimersAsync();
    await secondExpectation;

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("parses coordinate strings locally without calling Photon", async () => {
    await expect(geocodeAddress("-37.8136, 144.9631")).resolves.toEqual({
      lat: -37.8136,
      lng: 144.9631,
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
