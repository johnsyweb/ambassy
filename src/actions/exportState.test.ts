import { exportApplicationState, downloadStateFile } from "./exportState";
import { loadFromStorage } from "@utils/storage";
import { EventDetails } from "@models/EventDetails";

jest.mock("@utils/storage");

describe("exportState", () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => "blob:test-url");
    global.URL.revokeObjectURL = jest.fn();
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  describe("exportApplicationState", () => {

    it("should create ApplicationState blob from localStorage data", () => {
      const mockData = {
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
      };

      (loadFromStorage as jest.Mock)
        .mockReturnValueOnce(mockData.eventAmbassadors)
        .mockReturnValueOnce(mockData.eventTeams)
        .mockReturnValueOnce(mockData.regionalAmbassadors)
        .mockReturnValueOnce(mockData.changesLog);

      mockLocalStorage.getItem.mockReturnValue(null);

      const blob = exportApplicationState();

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("application/json");
    });

    it("should throw error when data is incomplete", () => {
      (loadFromStorage as jest.Mock)
        .mockReturnValueOnce([["EA1", { name: "Test EA", events: [] }]])
        .mockReturnValueOnce(null)
        .mockReturnValueOnce([
          ["REA1", { name: "Test REA", state: "VIC", supportsEAs: [] }],
        ])
        .mockReturnValueOnce([]);

      expect(() => exportApplicationState()).toThrow();
    });

    it("should default changesLog to empty array when null", () => {
      const mockData = {
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
      };

      (loadFromStorage as jest.Mock)
        .mockReturnValueOnce(mockData.eventAmbassadors)
        .mockReturnValueOnce(mockData.eventTeams)
        .mockReturnValueOnce(mockData.regionalAmbassadors)
        .mockReturnValueOnce(null); // changesLog is null

      mockLocalStorage.getItem.mockReturnValue(null);

      const blob = exportApplicationState();

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("application/json");
    });

    it("should include resolved eventDetails in export", async () => {
      const mockData = {
        eventAmbassadors: [["EA1", { name: "Test EA", events: ["ResolvedEvent"] }]],
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
          ["REA1", { name: "Test REA", state: "VIC", supportsEAs: ["EA1"] }],
        ],
        changesLog: [],
      };

      const resolvedEventDetails: EventDetails & { manualCoordinates?: boolean } = {
        id: "manual-ResolvedEvent",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [144.9631, -37.8136], // [lng, lat]
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

      const cacheData = JSON.stringify({
        timestamp: Date.now(),
        eventDetailsMap: [
          ["ResolvedEvent", resolvedEventDetails],
          ["NormalEvent", {
            id: "normal-event-id",
            type: "Feature",
            geometry: { type: "Point", coordinates: [144.9631, -37.8136] },
            properties: {
              eventname: "normalevent",
              EventLongName: "Normal Event",
              EventShortName: "NormalEvent",
              LocalisedEventLongName: null,
              countrycode: 13,
              seriesid: 1,
              EventLocation: "",
            },
          }],
        ],
      });

      (loadFromStorage as jest.Mock)
        .mockReturnValueOnce(mockData.eventAmbassadors)
        .mockReturnValueOnce(mockData.eventTeams)
        .mockReturnValueOnce(mockData.regionalAmbassadors)
        .mockReturnValueOnce(mockData.changesLog);

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "parkrun events") {
          return cacheData;
        }
        return null;
      });

      const blob = exportApplicationState();
      
      // Read blob using FileReader
      const jsonString = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read blob"));
        reader.readAsText(blob);
      });
      
      const exportedState = JSON.parse(jsonString);

      expect(exportedState.data.resolvedEventDetails).toBeDefined();
      expect(exportedState.data.resolvedEventDetails).toHaveLength(1);
      expect(exportedState.data.resolvedEventDetails[0][0]).toBe("ResolvedEvent");
      expect(exportedState.data.resolvedEventDetails[0][1].id).toBe("manual-ResolvedEvent");
      expect(exportedState.data.resolvedEventDetails[0][1].manualCoordinates).toBe(true);
    });

    it("should not include resolvedEventDetails if none exist", () => {
      const mockData = {
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
      };

      (loadFromStorage as jest.Mock)
        .mockReturnValueOnce(mockData.eventAmbassadors)
        .mockReturnValueOnce(mockData.eventTeams)
        .mockReturnValueOnce(mockData.regionalAmbassadors)
        .mockReturnValueOnce(mockData.changesLog);

      mockLocalStorage.getItem.mockReturnValue(null);

      const blob = exportApplicationState();
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe("downloadStateFile", () => {
    it("should trigger browser download", () => {
      const blob = new Blob(['{"test": "data"}'], { type: "application/json" });
      const filename = "ambassy-state-2026-01-07.json";

      const createElementSpy = jest.spyOn(document, "createElement");
      const appendChildSpy = jest.spyOn(document.body, "appendChild");
      const removeChildSpy = jest.spyOn(document.body, "removeChild");

      downloadStateFile(blob, filename);

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});
