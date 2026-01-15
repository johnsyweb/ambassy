import {
  calculateGeographicProximityScore,
  calculateReallocationScore,
  suggestEventReallocation,
  suggestEventAmbassadorReallocation,
} from "./suggestReallocation";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { CapacityLimits, defaultCapacityLimits } from "@models/CapacityLimits";
import { EventAmbassador } from "@models/EventAmbassador";

describe("suggestReallocation", () => {
  const limits: CapacityLimits = defaultCapacityLimits;

  describe("calculateGeographicProximityScore", () => {
    it("should return higher score for closer events", () => {
      const eventDetails: EventDetailsMap = new Map([
        ["Event1", {
          id: "1",
          type: "Feature",
          geometry: { type: "Point", coordinates: [-37.8136, 144.9631] },
          properties: {
            eventname: "Event1",
            EventLongName: "Event 1",
            EventShortName: "Event1",
            LocalisedEventLongName: null,
            countrycode: 13,
            seriesid: 1,
            EventLocation: "Melbourne",
          },
        }],
        ["Event2", {
          id: "2",
          type: "Feature",
          geometry: { type: "Point", coordinates: [-37.82, 144.97] },
          properties: {
            eventname: "Event2",
            EventLongName: "Event 2",
            EventShortName: "Event2",
            LocalisedEventLongName: null,
            countrycode: 13,
            seriesid: 1,
            EventLocation: "Melbourne",
          },
        }],
        ["Event3", {
          id: "3",
          type: "Feature",
          geometry: { type: "Point", coordinates: [-33.8688, 151.2093] },
          properties: {
            eventname: "Event3",
            EventLongName: "Event 3",
            EventShortName: "Event3",
            LocalisedEventLongName: null,
            countrycode: 13,
            seriesid: 1,
            EventLocation: "Sydney",
          },
        }],
      ]);

      const recipientEvents = ["Event1"];
      const reallocatingEvents = ["Event2"]; // Close to Event1
      const scoreClose = calculateGeographicProximityScore(recipientEvents, reallocatingEvents, eventDetails);

      const reallocatingEventsFar = ["Event3"]; // Far from Event1
      const scoreFar = calculateGeographicProximityScore(recipientEvents, reallocatingEventsFar, eventDetails);

      expect(scoreClose).toBeGreaterThan(scoreFar);
      expect(scoreClose).toBeGreaterThan(0);
    });

    it("should return 0 when recipient has no existing events", () => {
      const eventDetails: EventDetailsMap = new Map();
      const recipientEvents: string[] = [];
      const reallocatingEvents = ["Event1"];

      const score = calculateGeographicProximityScore(recipientEvents, reallocatingEvents, eventDetails);
      expect(score).toBe(0);
    });

    it("should return 0 when coordinates are missing", () => {
      const eventDetails: EventDetailsMap = new Map([
        ["Event1", {
          id: "1",
          type: "Feature",
          geometry: { type: "Point", coordinates: [0, 0] },
          properties: {
            eventname: "Event1",
            EventLongName: "Event 1",
            EventShortName: "Event1",
            LocalisedEventLongName: null,
            countrycode: 13,
            seriesid: 1,
            EventLocation: "Unknown",
          },
        }],
      ]);

      const recipientEvents = ["Event1"];
      const reallocatingEvents = ["Event2"]; // Event2 doesn't exist

      const score = calculateGeographicProximityScore(recipientEvents, reallocatingEvents, eventDetails);
      expect(score).toBe(0);
    });
  });

  describe("calculateReallocationScore", () => {
    it("should give higher score for recipients with more available capacity", () => {
      const eventDetails: EventDetailsMap = new Map();
      const recipient1: EventAmbassador = {
        name: "EA1",
        events: ["Event1"], // 1 event, can take 8 more (within limit)
        capacityStatus: undefined,
      };
      const recipient2: EventAmbassador = {
        name: "EA2",
        events: ["Event1", "Event2", "Event3", "Event4", "Event5", "Event6", "Event7", "Event8"], // 8 events, can take 1 more
        capacityStatus: undefined,
      };

      const items = ["Event9"];
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const score1 = calculateReallocationScore(recipient1, "EA1", items, "events", eventDetails, limits, regionalAmbassadors);
      const score2 = calculateReallocationScore(recipient2, "EA2", items, "events", eventDetails, limits, regionalAmbassadors);

      expect(score1).toBeGreaterThan(score2);
    });

    it("should give higher score for same region", () => {
      const eventDetails: EventDetailsMap = new Map();
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["REA1", { name: "REA1", state: "VIC", supportsEAs: ["EA1", "EA3"], capacityStatus: undefined }],
        ["REA2", { name: "REA2", state: "VIC", supportsEAs: ["EA2"], capacityStatus: undefined }],
      ]);
      const recipient1: EventAmbassador = {
        name: "EA1",
        events: ["Event1"],
        capacityStatus: undefined,
      };
      const recipient2: EventAmbassador = {
        name: "EA2",
        events: ["Event2"],
        capacityStatus: undefined,
      };

      const items = ["Event3"];
      const options = { fromRegionalAmbassador: "REA1" };
      const score1 = calculateReallocationScore(recipient1, "EA1", items, "events", eventDetails, limits, regionalAmbassadors, options);
      const score2 = calculateReallocationScore(recipient2, "EA2", items, "events", eventDetails, limits, regionalAmbassadors, options);

      expect(score1).toBeGreaterThan(score2);
    });

    it("should penalize recipients with conflicts", () => {
      const eventDetails: EventDetailsMap = new Map();
      const recipient1: EventAmbassador = {
        name: "EA1",
        events: ["Event1"],
        capacityStatus: undefined,
        conflicts: ["Event2"],
      };
      const recipient2: EventAmbassador = {
        name: "EA2",
        events: ["Event1"],
        capacityStatus: undefined,
        conflicts: [],
      };

      const items = ["Event2"];
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const score1 = calculateReallocationScore(recipient1, "EA1", items, "events", eventDetails, limits, regionalAmbassadors);
      const score2 = calculateReallocationScore(recipient2, "EA2", items, "events", eventDetails, limits, regionalAmbassadors);

      expect(score2).toBeGreaterThan(score1);
    });

    it("should consider geographic proximity when calculating score", () => {
      const eventDetails: EventDetailsMap = new Map([
        ["Event1", {
          id: "1",
          type: "Feature",
          geometry: { type: "Point", coordinates: [-37.8136, 144.9631] },
          properties: {
            eventname: "Event1",
            EventLongName: "Event 1",
            EventShortName: "Event1",
            LocalisedEventLongName: null,
            countrycode: 13,
            seriesid: 1,
            EventLocation: "Melbourne",
          },
        }],
        ["Event2", {
          id: "2",
          type: "Feature",
          geometry: { type: "Point", coordinates: [-37.82, 144.97] },
          properties: {
            eventname: "Event2",
            EventLongName: "Event 2",
            EventShortName: "Event2",
            LocalisedEventLongName: null,
            countrycode: 13,
            seriesid: 1,
            EventLocation: "Melbourne",
          },
        }],
      ]);

      const recipient1: EventAmbassador = {
        name: "EA1",
        events: ["Event1"], // Has Event1, close to Event2
        capacityStatus: undefined,
      };
      const recipient2: EventAmbassador = {
        name: "EA2",
        events: [], // No events, can't calculate proximity
        capacityStatus: undefined,
      };

      const items = ["Event2"];
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const score1 = calculateReallocationScore(recipient1, "EA1", items, "events", eventDetails, limits, regionalAmbassadors);
      const score2 = calculateReallocationScore(recipient2, "EA2", items, "events", eventDetails, limits, regionalAmbassadors);

      // Recipient1 should score higher due to proximity (if both have capacity)
      expect(score1).toBeGreaterThanOrEqual(score2);
    });
  });

  describe("suggestEventReallocation", () => {
    it("should generate suggestions sorted by score", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: ["Event1"], capacityStatus: undefined }],
        ["EA2", { name: "EA2", events: ["Event2"], capacityStatus: undefined }],
        ["EA3", { name: "EA3", events: Array(8).fill("Event").map((_, i) => `Event${i + 10}`), capacityStatus: undefined }],
      ]);

      const eventDetails: EventDetailsMap = new Map([
        ["Event1", {
          id: "1",
          type: "Feature",
          geometry: { type: "Point", coordinates: [-37.8136, 144.9631] },
          properties: {
            eventname: "Event1",
            EventLongName: "Event 1",
            EventShortName: "Event1",
            LocalisedEventLongName: null,
            countrycode: 13,
            seriesid: 1,
            EventLocation: "Melbourne",
          },
        }],
        ["Event2", {
          id: "2",
          type: "Feature",
          geometry: { type: "Point", coordinates: [-37.82, 144.97] },
          properties: {
            eventname: "Event2",
            EventLongName: "Event 2",
            EventShortName: "Event2",
            LocalisedEventLongName: null,
            countrycode: 13,
            seriesid: 1,
            EventLocation: "Melbourne",
          },
        }],
      ]);

      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const suggestions = suggestEventReallocation(
        "EA1",
        ["Event1"],
        eventAmbassadors,
        eventDetails,
        limits,
        regionalAmbassadors
      );

      expect(suggestions.length).toBeGreaterThan(0);
      // Suggestions should be sorted by score (highest first)
      for (let i = 0; i < suggestions.length - 1; i++) {
        expect(suggestions[i].score).toBeGreaterThanOrEqual(suggestions[i + 1].score);
      }
    });

    it("should throw error if fromAmbassador doesn't exist", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map();
      const eventDetails: EventDetailsMap = new Map();

      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      expect(() => {
        suggestEventReallocation("Nonexistent", ["Event1"], eventAmbassadors, eventDetails, limits, regionalAmbassadors);
      }).toThrow();
    });

    it("should throw error if events array is empty", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], capacityStatus: undefined }],
      ]);
      const eventDetails: EventDetailsMap = new Map();

      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      expect(() => {
        suggestEventReallocation("EA1", [], eventAmbassadors, eventDetails, limits, regionalAmbassadors);
      }).toThrow();
    });

    it("should include liveEventsCount and prospectEventsCount in suggestions", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: ["Event1"], capacityStatus: undefined }],
        ["EA2", { 
          name: "EA2", 
          events: ["Event2", "Event3"], 
          prospectiveEvents: ["prospect1", "prospect2"],
          capacityStatus: undefined 
        }],
      ]);

      const eventDetails: EventDetailsMap = new Map([
        ["Event1", {
          id: "1",
          type: "Feature",
          geometry: { type: "Point", coordinates: [-37.8136, 144.9631] },
          properties: {
            eventname: "Event1",
            EventLongName: "Event 1",
            EventShortName: "Event1",
            LocalisedEventLongName: null,
            countrycode: 13,
            seriesid: 1,
            EventLocation: "Melbourne",
          },
        }],
        ["Event2", {
          id: "2",
          type: "Feature",
          geometry: { type: "Point", coordinates: [-37.82, 144.97] },
          properties: {
            eventname: "Event2",
            EventLongName: "Event 2",
            EventShortName: "Event2",
            LocalisedEventLongName: null,
            countrycode: 13,
            seriesid: 1,
            EventLocation: "Melbourne",
          },
        }],
      ]);

      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const suggestions = suggestEventReallocation(
        "EA1",
        ["Event1"],
        eventAmbassadors,
        eventDetails,
        limits,
        regionalAmbassadors
      );

      const ea2Suggestion = suggestions.find(s => s.toAmbassador === "EA2");
      expect(ea2Suggestion).toBeDefined();
      expect(ea2Suggestion?.liveEventsCount).toBe(2);
      expect(ea2Suggestion?.prospectEventsCount).toBe(2);
      expect(ea2Suggestion?.allocationCount).toBe(4);
    });

    it("should use total allocations (live + prospect) for scoring prioritisation", () => {
      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: ["Event1"], capacityStatus: undefined }],
        ["EA2", { 
          name: "EA2", 
          events: [], 
          prospectiveEvents: ["prospect1"],
          capacityStatus: undefined 
        }],
        ["EA3", { 
          name: "EA3", 
          events: ["Event2"], 
          capacityStatus: undefined 
        }],
      ]);

      const eventDetails: EventDetailsMap = new Map([
        ["Event1", {
          id: "1",
          type: "Feature",
          geometry: { type: "Point", coordinates: [-37.8136, 144.9631] },
          properties: {
            eventname: "Event1",
            EventLongName: "Event 1",
            EventShortName: "Event1",
            LocalisedEventLongName: null,
            countrycode: 13,
            seriesid: 1,
            EventLocation: "Melbourne",
          },
        }],
        ["Event2", {
          id: "2",
          type: "Feature",
          geometry: { type: "Point", coordinates: [-37.82, 144.97] },
          properties: {
            eventname: "Event2",
            EventLongName: "Event 2",
            EventShortName: "Event2",
            LocalisedEventLongName: null,
            countrycode: 13,
            seriesid: 1,
            EventLocation: "Melbourne",
          },
        }],
      ]);

      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const suggestions = suggestEventReallocation(
        "EA1",
        ["Event1"],
        eventAmbassadors,
        eventDetails,
        limits,
        regionalAmbassadors
      );

      const ea2Suggestion = suggestions.find(s => s.toAmbassador === "EA2");
      const ea3Suggestion = suggestions.find(s => s.toAmbassador === "EA3");
      
      expect(ea2Suggestion).toBeDefined();
      expect(ea3Suggestion).toBeDefined();
      
      expect(ea2Suggestion?.allocationCount).toBe(1);
      expect(ea3Suggestion?.allocationCount).toBe(1);
      
      expect(ea2Suggestion?.liveEventsCount).toBe(0);
      expect(ea2Suggestion?.prospectEventsCount).toBe(1);
      expect(ea3Suggestion?.liveEventsCount).toBe(1);
      expect(ea3Suggestion?.prospectEventsCount).toBe(0);
    });
  });

  describe("suggestEventAmbassadorReallocation", () => {
    it("should generate suggestions for Regional Ambassador reallocation", () => {
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["REA1", { name: "REA1", state: "VIC", supportsEAs: ["EA1"], capacityStatus: undefined }],
        ["REA2", { name: "REA2", state: "VIC", supportsEAs: ["EA2"], capacityStatus: undefined }],
      ]);

      const eventAmbassadors: EventAmbassadorMap = new Map([
        ["EA1", { name: "EA1", events: [], capacityStatus: undefined }],
        ["EA2", { name: "EA2", events: [], capacityStatus: undefined }],
      ]);

      const suggestions = suggestEventAmbassadorReallocation(
        "REA1",
        ["EA1"],
        regionalAmbassadors,
        eventAmbassadors,
        limits
      );

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].toAmbassador).toBe("REA2");
    });

    it("should throw error if fromAmbassador doesn't exist", () => {
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();
      const eventAmbassadors: EventAmbassadorMap = new Map();

      expect(() => {
        suggestEventAmbassadorReallocation("Nonexistent", ["EA1"], regionalAmbassadors, eventAmbassadors, limits);
      }).toThrow();
    });
  });
});

