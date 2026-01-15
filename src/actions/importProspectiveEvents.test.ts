import { importProspectiveEvents } from "./importProspectiveEvents";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import {
  saveProspectiveEvents,
  loadProspectiveEvents,
} from "./persistProspectiveEvents";
import { geocodeProspectiveEvent } from "@utils/geography";

// Mock dependencies
jest.mock("./persistProspectiveEvents");
jest.mock("@utils/geography");

const mockSaveProspectiveEvents = saveProspectiveEvents as jest.MockedFunction<
  typeof saveProspectiveEvents
>;
const mockLoadProspectiveEvents = loadProspectiveEvents as jest.MockedFunction<
  typeof loadProspectiveEvents
>;
const mockGeocodeProspectiveEvent =
  geocodeProspectiveEvent as jest.MockedFunction<
    typeof geocodeProspectiveEvent
  >;

describe("importProspectiveEvents", () => {
  const validHeaders =
    "Prospect Event,Country,State,Prospect ED/s,EA,Date Made Contact,Course Found,Landowner Permission,Funding Confirmed";
  const validCSV =
    validHeaders +
    "\nBotanical Gardens,Australia,VIC,John Smith,Jane Doe,2024-01-15,true,false,true";

  let mockEventAmbassadors: EventAmbassadorMap;
  let mockRegionalAmbassadors: RegionalAmbassadorMap;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup geography mock
    mockGeocodeProspectiveEvent.mockResolvedValue({
      success: true,
      coordinates: { latitude: -37.8136, longitude: 144.9631 }, // Melbourne coordinates
    });

    // Setup mock ambassador data
    mockEventAmbassadors = new Map();
    mockEventAmbassadors.set("Jane Doe", {
      name: "Jane Doe",
      events: ["Test Event"],
      prospectiveEvents: [],
      regionalAmbassador: "Regional Ambassador 1",
    });

    mockRegionalAmbassadors = new Map();
    mockRegionalAmbassadors.set("Regional Ambassador 1", {
      name: "Regional Ambassador 1",
      state: "VIC",
      supportsEAs: ["Jane Doe"],
      prospectiveEvents: [],
    });

    // Mock persistence functions
    mockLoadProspectiveEvents.mockReturnValue([]);

    // Mock successful geocoding
    mockGeocodeProspectiveEvent.mockResolvedValue({
      success: true,
      coordinates: { latitude: -37.8136, longitude: 144.9631 }, // Melbourne coordinates
    });
  });

  describe("successful imports", () => {
    it("should import valid CSV successfully", async () => {
      const result = await importProspectiveEvents(
        validCSV,
        mockEventAmbassadors,
        mockRegionalAmbassadors,
      );

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(mockSaveProspectiveEvents).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple events in CSV", async () => {
      const multiEventCSV =
        validHeaders +
        "\nBotanical Gardens,Australia,VIC,John Smith,Jane Doe,2024-01-15,true,false,true" +
        "\nCity Park,Australia,NSW,Mary Johnson,John Smith,2024-02-01,false,true,false";

      // Add second ambassador
      mockEventAmbassadors.set("John Smith", {
        name: "John Smith",
        events: ["Another Event"],
        prospectiveEvents: [],
        regionalAmbassador: "Regional Ambassador 2",
      });

      const result = await importProspectiveEvents(
        multiEventCSV,
        mockEventAmbassadors,
        mockRegionalAmbassadors,
      );

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle geocoding failures gracefully", async () => {
      mockGeocodeProspectiveEvent.mockResolvedValueOnce({
        success: false,
        error: "Location not found",
      });

      const result = await importProspectiveEvents(
        validCSV,
        mockEventAmbassadors,
        mockRegionalAmbassadors,
      );

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.warnings).toContain(
        'Event "Botanical Gardens": Geocoding failed: Location not found',
      );
    });

    it("should handle unmatched ambassadors", async () => {
      const csvWithUnmatchedEA =
        validHeaders +
        "\nBotanical Gardens,Australia,VIC,John Smith,Unknown Ambassador,2024-01-15,true,false,true";

      const result = await importProspectiveEvents(
        csvWithUnmatchedEA,
        mockEventAmbassadors,
        mockRegionalAmbassadors,
      );

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toMatch(/Ambassador not found/);
    });
  });

  describe("error handling", () => {
    it("should reject CSV with parse errors", async () => {
      const invalidCSV = "Invalid,Headers\nBotanical Gardens,Australia,VIC";

      const result = await importProspectiveEvents(
        invalidCSV,
        mockEventAmbassadors,
        mockRegionalAmbassadors,
      );

      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(mockSaveProspectiveEvents).not.toHaveBeenCalled();
    });

    it("should handle geocoding network errors", async () => {
      mockGeocodeProspectiveEvent.mockRejectedValueOnce(
        new Error("Network error"),
      );

      const result = await importProspectiveEvents(
        validCSV,
        mockEventAmbassadors,
        mockRegionalAmbassadors,
      );

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.warnings).toContain(
        'Event "Botanical Gardens": Geocoding error: Network error',
      );
    });

    it("should handle empty CSV", async () => {
      const result = await importProspectiveEvents(
        validHeaders,
        mockEventAmbassadors,
        mockRegionalAmbassadors,
      );

      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("data processing", () => {
    it("should match ambassadors correctly", async () => {
      const result = await importProspectiveEvents(
        validCSV,
        mockEventAmbassadors,
        mockRegionalAmbassadors,
      );

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);

      // Verify the saved data includes the matched ambassador
      const saveCall = mockSaveProspectiveEvents.mock.calls[0][0];
      expect(saveCall).toHaveLength(1);
      expect(saveCall[0].eventAmbassador).toBe("Jane Doe");
      expect(saveCall[0].ambassadorMatchStatus).toBe("matched");
    });

    it("should preserve existing prospective events", async () => {
      const existingProspects = [
        {
          id: "existing-1",
          prospectEvent: "Existing Event",
          country: "Australia",
          state: "NSW",
          prospectEDs: "Existing ED",
          eventAmbassador: "Jane Doe",
          dateMadeContact: new Date("2024-01-01"),
          courseFound: true,
          landownerPermission: true,
          fundingConfirmed: true,
          geocodingStatus: "success" as const,
          ambassadorMatchStatus: "matched" as const,
          importTimestamp: Date.now(),
          sourceRow: 1,
        },
      ];

      mockLoadProspectiveEvents.mockReturnValue(existingProspects);

      const result = await importProspectiveEvents(
        validCSV,
        mockEventAmbassadors,
        mockRegionalAmbassadors,
      );

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);

      // Verify both existing and new prospects are saved
      const saveCall = mockSaveProspectiveEvents.mock.calls[0][0];
      expect(saveCall).toHaveLength(2);
      expect(
        saveCall.some((p: ProspectiveEvent) => p.prospectEvent === "Existing Event"),
      ).toBe(true);
      expect(
        saveCall.some((p: ProspectiveEvent) => p.prospectEvent === "Botanical Gardens"),
      ).toBe(true);
    });

    it("should prevent duplicate prospects from being imported", async () => {
      // Set up existing prospects that would already be in storage
      const existingProspects = [
        {
          id: "existing-botanical-gardens",
          prospectEvent: "Botanical Gardens",
          country: "Australia",
          state: "VIC",
          prospectEDs: "John Smith",
          eventAmbassador: "Jane Doe",
          dateMadeContact: new Date("2024-01-15"),
          courseFound: true,
          landownerPermission: false,
          fundingConfirmed: true,
          geocodingStatus: "success" as const,
          ambassadorMatchStatus: "matched" as const,
          importTimestamp: Date.now() - 1000,
          sourceRow: 2,
        },
      ];

      // Set up the mock BEFORE the import call
      mockLoadProspectiveEvents.mockReturnValue(existingProspects);

      // Try to import the same prospect again
      const duplicateResult = await importProspectiveEvents(
        validCSV,
        mockEventAmbassadors,
        mockRegionalAmbassadors,
      );

      expect(duplicateResult.success).toBe(true);
      expect(duplicateResult.imported).toBe(0); // No new prospects imported
      expect(duplicateResult.warnings).toHaveLength(1);
      expect(duplicateResult.warnings[0]).toContain(
        "Duplicate prospect skipped",
      );
    });
  });

  describe("ambassador matching", () => {
    it("should match ambassadors without spaces", async () => {
      const csvWithSpacelessEA =
        validHeaders +
        "\nBotanical Gardens,Australia,VIC,John Smith,JohnSmith,2024-01-15,true,false,true";

      // Add ambassador with spaces
      mockEventAmbassadors.set("John Smith", {
        name: "John Smith",
        events: ["Test Event"],
        prospectiveEvents: [],
        regionalAmbassador: "Regional Ambassador 1",
      });

      const result = await importProspectiveEvents(
        csvWithSpacelessEA,
        mockEventAmbassadors,
        mockRegionalAmbassadors,
      );

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.warnings).toHaveLength(0); // Should match successfully
    });

    it("should handle fuzzy matching for similar names", async () => {
      const csvWithSimilarEA =
        validHeaders +
        "\nBotanical Gardens,Australia,VIC,John Smith,JaneDo,2024-01-15,true,false,true";

      const result = await importProspectiveEvents(
        csvWithSimilarEA,
        mockEventAmbassadors,
        mockRegionalAmbassadors,
      );

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      // JaneDo should fuzzy match to Jane Doe
      expect(result.warnings).toHaveLength(0);
    });
  });
});
