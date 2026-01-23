import { validateStateFile, importApplicationState } from "./importState";
import { ApplicationState } from "@models/ApplicationState";
import { EventDetails } from "@models/EventDetails";
import { saveToStorage } from "@utils/storage";

jest.mock("@utils/storage");

describe("importState", () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe("validateStateFile", () => {
    it("should validate and parse valid state file", async () => {
      const validState: ApplicationState = {
        version: "1.0.0",
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [["EA1", { name: "Test EA", events: [] }]],
          eventTeams: [
            [
              "Event1",
              {
                eventShortName: "Event1",
                eventAmbassador: "EA1",
                eventDirectors: [],
              },
            ],
          ],
          regionalAmbassadors: [
            ["REA1", { name: "Test REA", state: "VIC", supportsEAs: [] }],
          ],
          changesLog: [],
        },
      };

      const file = new File([JSON.stringify(validState)], "test.json", {
        type: "application/json",
      });

      const result = await validateStateFile(file);
      expect(result).toEqual(validState);
    });

    it("should throw error for invalid JSON", async () => {
      const file = new File(["not json"], "test.json", {
        type: "application/json",
      });

      await expect(validateStateFile(file)).rejects.toThrow();
    });

    it("should throw error for missing version field", async () => {
      const invalidState = {
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [],
          eventTeams: [],
          regionalAmbassadors: [],
          changesLog: [],
        },
      };

      const file = new File([JSON.stringify(invalidState)], "test.json", {
        type: "application/json",
      });

      await expect(validateStateFile(file)).rejects.toThrow();
    });

    it("should throw error for version mismatch", async () => {
      const invalidState: ApplicationState = {
        version: "2.0.0",
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [],
          eventTeams: [],
          regionalAmbassadors: [],
          changesLog: [],
        },
      };

      const file = new File([JSON.stringify(invalidState)], "test.json", {
        type: "application/json",
      });

      await expect(validateStateFile(file)).rejects.toThrow();
    });

    it("should throw error for missing data fields", async () => {
      const invalidState = {
        version: "1.0.0",
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [],
        },
      };

      const file = new File([JSON.stringify(invalidState)], "test.json", {
        type: "application/json",
      });

      await expect(validateStateFile(file)).rejects.toThrow();
    });
  });

  describe("importApplicationState", () => {
    it("should persist imported state to storage", () => {
      const state: ApplicationState = {
        version: "1.0.0",
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [["EA1", { name: "Test EA", events: [] }]],
          eventTeams: [
            [
              "Event1",
              {
                eventShortName: "Event1",
                eventAmbassador: "EA1",
                eventDirectors: [],
              },
            ],
          ],
          regionalAmbassadors: [
            ["REA1", { name: "Test REA", state: "VIC", supportsEAs: [] }],
          ],
          changesLog: [],
        },
      };

      importApplicationState(state);

      expect(saveToStorage).toHaveBeenCalledWith(
        "eventAmbassadors",
        state.data.eventAmbassadors,
      );
      expect(saveToStorage).toHaveBeenCalledWith(
        "eventTeams",
        state.data.eventTeams,
      );
      expect(saveToStorage).toHaveBeenCalledWith(
        "regionalAmbassadors",
        state.data.regionalAmbassadors,
      );
      expect(saveToStorage).toHaveBeenCalledWith(
        "changesLog",
        state.data.changesLog,
      );
    });

    it("should restore resolved eventDetails to cache", () => {
      const resolvedEventDetails: EventDetails & { manualCoordinates?: boolean } = {
        id: "manual-ResolvedEvent",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [144.9631, -37.8136],
        },
        properties: {
          eventname: "resolvedevent",
          EventLongName: "Resolved Event",
          EventShortName: "ResolvedEvent",
          LocalisedEventLongName: null,
          countrycode: 13,
          seriesid: 1,
          EventLocation: "",
        },
        manualCoordinates: true,
      };

      const state: ApplicationState = {
        version: "1.0.0",
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [["EA1", { name: "Test EA", events: [] }]],
          eventTeams: [
            [
              "Event1",
              {
                eventShortName: "Event1",
                eventAmbassador: "EA1",
                eventDirectors: [],
              },
            ],
          ],
          regionalAmbassadors: [
            ["REA1", { name: "Test REA", state: "VIC", supportsEAs: [] }],
          ],
          changesLog: [],
          resolvedEventDetails: [["ResolvedEvent", resolvedEventDetails]],
        },
      };

      importApplicationState(state);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "parkrun events",
        expect.stringContaining("ResolvedEvent"),
      );
      
      const setItemCalls = (mockLocalStorage.setItem as jest.Mock).mock.calls;
      const parkrunEventsCall = setItemCalls.find((call) => call[0] === "parkrun events");
      expect(parkrunEventsCall).toBeDefined();
      
      const cachedData = JSON.parse(parkrunEventsCall[1]);
      expect(cachedData.eventDetailsMap).toBeDefined();
      expect(cachedData.eventDetailsMap).toHaveLength(1);
      expect(cachedData.eventDetailsMap[0][0]).toBe("ResolvedEvent");
      expect(cachedData.eventDetailsMap[0][1].id).toBe("manual-ResolvedEvent");
    });

    it("should merge resolved eventDetails with existing cache", () => {
      const existingEvent: EventDetails = {
        id: "existing-event-id",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [145.0, -38.0],
        },
        properties: {
          eventname: "existingevent",
          EventLongName: "Existing Event",
          EventShortName: "ExistingEvent",
          LocalisedEventLongName: null,
          countrycode: 13,
          seriesid: 1,
          EventLocation: "",
        },
      };

      const resolvedEventDetails: EventDetails & { manualCoordinates?: boolean } = {
        id: "manual-ResolvedEvent",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [144.9631, -37.8136],
        },
        properties: {
          eventname: "resolvedevent",
          EventLongName: "Resolved Event",
          EventShortName: "ResolvedEvent",
          LocalisedEventLongName: null,
          countrycode: 13,
          seriesid: 1,
          EventLocation: "",
        },
        manualCoordinates: true,
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({
          timestamp: Date.now(),
          eventDetailsMap: [["ExistingEvent", existingEvent]],
        }),
      );

      const state: ApplicationState = {
        version: "1.0.0",
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [["EA1", { name: "Test EA", events: [] }]],
          eventTeams: [
            [
              "Event1",
              {
                eventShortName: "Event1",
                eventAmbassador: "EA1",
                eventDirectors: [],
              },
            ],
          ],
          regionalAmbassadors: [
            ["REA1", { name: "Test REA", state: "VIC", supportsEAs: [] }],
          ],
          changesLog: [],
          resolvedEventDetails: [["ResolvedEvent", resolvedEventDetails]],
        },
      };

      importApplicationState(state);

      const setItemCalls = (mockLocalStorage.setItem as jest.Mock).mock.calls;
      const parkrunEventsCall = setItemCalls.find((call) => call[0] === "parkrun events");
      expect(parkrunEventsCall).toBeDefined();
      
      const cachedData = JSON.parse(parkrunEventsCall[1]);
      expect(cachedData.eventDetailsMap).toHaveLength(2);
      
      const eventMap = new Map<string, EventDetails>(cachedData.eventDetailsMap);
      expect(eventMap.has("ExistingEvent")).toBe(true);
      expect(eventMap.has("ResolvedEvent")).toBe(true);
      const resolvedEvent = eventMap.get("ResolvedEvent");
      expect(resolvedEvent).toBeDefined();
      expect(resolvedEvent?.id).toBe("manual-ResolvedEvent");
    });

    it("should handle import without resolvedEventDetails", () => {
      const state: ApplicationState = {
        version: "1.0.0",
        exportedAt: "2026-01-07T12:00:00Z",
        data: {
          eventAmbassadors: [["EA1", { name: "Test EA", events: [] }]],
          eventTeams: [
            [
              "Event1",
              {
                eventShortName: "Event1",
                eventAmbassador: "EA1",
                eventDirectors: [],
              },
            ],
          ],
          regionalAmbassadors: [
            ["REA1", { name: "Test REA", state: "VIC", supportsEAs: [] }],
          ],
          changesLog: [],
        },
      };

      importApplicationState(state);

      // Should not call setItem for parkrun events if no resolvedEventDetails
      const setItemCalls = (mockLocalStorage.setItem as jest.Mock).mock.calls;
      const parkrunEventsCall = setItemCalls.find((call) => call[0] === "parkrun events");
      expect(parkrunEventsCall).toBeUndefined();
    });
  });
});
