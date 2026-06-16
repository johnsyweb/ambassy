import {
  EVENTS_CATALOGUE_CACHE_KEY,
  getEvents,
  invalidateEventsCatalogueMemoryCache,
  setEventsCatalogueMemoryCache,
} from "./fetchEvents";
import { EventDetails } from "@models/EventDetails";

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
function sampleEvent(shortName: string): EventDetails {
  return {
    id: shortName,
    type: "Feature",
    geometry: { type: "Point", coordinates: [144.9, -37.8] },
    properties: {
      eventname: shortName,
      EventLongName: shortName,
      EventShortName: shortName,
      LocalisedEventLongName: null,
      countrycode: 3,
      seriesid: 1,
      EventLocation: "Location",
    },
  };
}

describe("getEvents memory cache", () => {
  beforeEach(() => {
    localStorage.clear();
    invalidateEventsCatalogueMemoryCache();
    jest.restoreAllMocks();
  });

  it("returns the same map without re-parsing localStorage on a second call", async () => {
    const parseSpy = jest.spyOn(JSON, "parse");
    localStorage.setItem(
      EVENTS_CATALOGUE_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        eventDetailsMap: [["event1", sampleEvent("event1")]],
      }),
    );

    const first = await getEvents();
    const parseCallsAfterFirst = parseSpy.mock.calls.length;
    const second = await getEvents();

    expect(second).toBe(first);
    expect(parseSpy.mock.calls.length).toBe(parseCallsAfterFirst);
  });

  it("re-reads localStorage after the memory cache is invalidated", async () => {
    localStorage.setItem(
      EVENTS_CATALOGUE_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        eventDetailsMap: [["event1", sampleEvent("event1")]],
      }),
    );

    const first = await getEvents();
    invalidateEventsCatalogueMemoryCache();
    const parseSpy = jest.spyOn(JSON, "parse");
    const second = await getEvents();

    expect(second).not.toBe(first);
    expect(parseSpy).toHaveBeenCalled();
    expect(second.get("event1")).toBeDefined();
  });

  it("reuses the in-memory map after persistEventDetails updates localStorage", async () => {
    localStorage.setItem(
      EVENTS_CATALOGUE_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        eventDetailsMap: [["event1", sampleEvent("event1")]],
      }),
    );

    const initial = await getEvents();
    const updated = new Map(initial);
    updated.set("resolved", sampleEvent("resolved"));
    setEventsCatalogueMemoryCache(updated);

    const parseSpy = jest.spyOn(JSON, "parse");
    const second = await getEvents();

    expect(second).toBe(updated);
    expect(second.get("resolved")).toBeDefined();
    expect(parseSpy).not.toHaveBeenCalled();
  });
});
