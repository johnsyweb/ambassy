import { showReallocationDialog } from "./showReallocationDialog";
import { ReallocationSuggestion } from "../models/ReallocationSuggestion";
import { EventAmbassadorMap } from "../models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";
import { EventDetailsMap } from "../models/EventDetailsMap";

jest.mock("./getReallocationSuggestions");

describe("showReallocationDialog", () => {
  let dialog: HTMLElement;
  let title: HTMLElement;
  let content: HTMLElement;
  let cancelButton: HTMLButtonElement;
  let onSelect: jest.Mock;
  let onCancel: jest.Mock;
  let suggestions: ReallocationSuggestion[];
  let eventAmbassadors: EventAmbassadorMap;

  beforeEach(() => {
    eventAmbassadors = new Map();
    eventAmbassadors.set("Current EA", { name: "Current EA", events: [] });
    eventAmbassadors.set("EA 1", { name: "EA 1", events: [] });
    eventAmbassadors.set("EA 2", { name: "EA 2", events: [] });
    eventAmbassadors.set("EA 3", { name: "EA 3", events: [] });
    eventAmbassadors.set("EA 4", { name: "EA 4", events: [] });
    document.body.innerHTML = `
      <div id="reallocationDialog" role="dialog" aria-labelledby="reallocationDialogTitle" aria-modal="true" style="display: none;">
        <h2 id="reallocationDialogTitle">Select Recipient</h2>
        <div id="reallocationDialogContent"></div>
        <button type="button" id="reallocationDialogCancel">Cancel</button>
      </div>
    `;

    dialog = document.getElementById("reallocationDialog")!;
    title = document.getElementById("reallocationDialogTitle")!;
    content = document.getElementById("reallocationDialogContent")!;
    cancelButton = document.getElementById("reallocationDialogCancel") as HTMLButtonElement;

    onSelect = jest.fn();
    onCancel = jest.fn();

    suggestions = [
      {
        fromAmbassador: "Current EA",
        toAmbassador: "EA 1",
        items: ["test-event"],
        score: 85,
        reasons: ["Has available capacity", "Geographic proximity"],
      },
      {
        fromAmbassador: "Current EA",
        toAmbassador: "EA 2",
        items: ["test-event"],
        score: 75,
        reasons: ["Same region"],
      },
      {
        fromAmbassador: "Current EA",
        toAmbassador: "EA 3",
        items: ["test-event"],
        score: 65,
        reasons: ["Has available capacity"],
        warnings: ["Would exceed capacity limit"],
      },
    ];
  });

  it("should display dialog with suggestions", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    expect(dialog.style.display).not.toBe("none");
    expect(title.textContent).toContain("test-event");
  });

  it("should create suggestion buttons for top suggestions", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const buttons = content.querySelectorAll("button.suggestion-button");
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.length).toBeLessThanOrEqual(5);
  });

  it("should display ambassador name and score on suggestion buttons", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    expect(firstButton).not.toBeNull();
    expect(firstButton.textContent).toContain("EA 1");
    expect(firstButton.textContent).toContain("85");
  });

  it("should display reasons for suggestions", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    const reasonsText = firstButton.textContent || "";
    expect(reasonsText).toContain("Has available capacity");
    expect(reasonsText).toContain("Geographic proximity");
  });

  it("should display warnings for suggestions", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const buttons = Array.from(content.querySelectorAll("button.suggestion-button")) as HTMLButtonElement[];
    const buttonWithWarning = buttons.find((btn) => btn.textContent?.includes("Would exceed capacity limit"));
    expect(buttonWithWarning).not.toBeUndefined();
  });

  it("should create Other dropdown with all ambassadors", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const dropdown = content.querySelector("select#otherRecipientSelect") as HTMLSelectElement;
    expect(dropdown).not.toBeNull();
  });

  it("should display short form format in Other dropdown with live+prospect counts", () => {
    eventAmbassadors.set("EA 1", { name: "EA 1", events: ["Event1", "Event2"], prospectiveEvents: ["prospect1"] });
    const eventDetails: EventDetailsMap = new Map([
      ["test-event", {
        id: "test",
        type: "Feature",
        geometry: { type: "Point", coordinates: [-37.8136, 144.9631] },
        properties: {
          eventname: "test-event",
          EventLongName: "Test Event",
          EventShortName: "test-event",
          LocalisedEventLongName: null,
          countrycode: 13,
          seriesid: 1,
          EventLocation: "Melbourne",
        },
      }],
      ["Event1", {
        id: "1",
        type: "Feature",
        geometry: { type: "Point", coordinates: [-37.82, 144.97] },
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
    ]);

    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel, eventDetails);

    const dropdown = content.querySelector("select#otherRecipientSelect") as HTMLSelectElement;
    const ea1Option = Array.from(dropdown.options).find(opt => opt.value === "EA 1");
    expect(ea1Option).toBeDefined();
    expect(ea1Option?.textContent).toContain("EA 1");
    expect(ea1Option?.textContent).toContain("2+1=3 allocations");
  });

  it("should display REA name in Other dropdown format", () => {
    const regionalAmbassadors: RegionalAmbassadorMap = new Map([
      ["REA 1", { name: "REA 1", state: "VIC", supportsEAs: ["EA 1"] }],
    ]);
    eventAmbassadors.set("EA 1", { name: "EA 1", events: ["Event1"] });

    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, regionalAmbassadors, onSelect, onCancel);

    const dropdown = content.querySelector("select#otherRecipientSelect") as HTMLSelectElement;
    const ea1Option = Array.from(dropdown.options).find(opt => opt.value === "EA 1");
    expect(ea1Option).toBeDefined();
    expect(ea1Option?.textContent).toContain("[REA 1]");
  });

  it("should display 'Unassigned' for REA in Other dropdown when missing", () => {
    eventAmbassadors.set("EA 1", { name: "EA 1", events: ["Event1"] });

    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const dropdown = content.querySelector("select#otherRecipientSelect") as HTMLSelectElement;
    const ea1Option = Array.from(dropdown.options).find(opt => opt.value === "EA 1");
    expect(ea1Option).toBeDefined();
    expect(ea1Option?.textContent).toContain("[Unassigned]");
  });

  it("should display distance in Other dropdown when eventDetails available", () => {
    eventAmbassadors.set("EA 1", { name: "EA 1", events: ["Event1"] });
    const eventDetails: EventDetailsMap = new Map([
      ["test-event", {
        id: "test",
        type: "Feature",
        geometry: { type: "Point", coordinates: [-37.8136, 144.9631] },
        properties: {
          eventname: "test-event",
          EventLongName: "Test Event",
          EventShortName: "test-event",
          LocalisedEventLongName: null,
          countrycode: 13,
          seriesid: 1,
          EventLocation: "Melbourne",
        },
      }],
      ["Event1", {
        id: "1",
        type: "Feature",
        geometry: { type: "Point", coordinates: [-37.82, 144.97] },
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
    ]);

    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel, eventDetails);

    const dropdown = content.querySelector("select#otherRecipientSelect") as HTMLSelectElement;
    const ea1Option = Array.from(dropdown.options).find(opt => opt.value === "EA 1");
    expect(ea1Option).toBeDefined();
    expect(ea1Option?.textContent).toMatch(/\d+\.\d+ km to Event1/);
  });

  it("should omit distance in Other dropdown when EA has no events", () => {
    eventAmbassadors.set("EA 1", { name: "EA 1", events: [] });
    const eventDetails: EventDetailsMap = new Map([
      ["test-event", {
        id: "test",
        type: "Feature",
        geometry: { type: "Point", coordinates: [-37.8136, 144.9631] },
        properties: {
          eventname: "test-event",
          EventLongName: "Test Event",
          EventShortName: "test-event",
          LocalisedEventLongName: null,
          countrycode: 13,
          seriesid: 1,
          EventLocation: "Melbourne",
        },
      }],
    ]);

    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel, eventDetails);

    const dropdown = content.querySelector("select#otherRecipientSelect") as HTMLSelectElement;
    const ea1Option = Array.from(dropdown.options).find(opt => opt.value === "EA 1");
    expect(ea1Option).toBeDefined();
    expect(ea1Option?.textContent).toContain("0+0=0 allocations");
    expect(ea1Option?.textContent).not.toContain("km to");
  });

  it("should call onSelect when suggestion button is clicked", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    firstButton.click();

    expect(onSelect).toHaveBeenCalledWith("EA 1");
  });

  it("should call onSelect when Other dropdown option is selected", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const dropdown = content.querySelector("select#otherRecipientSelect") as HTMLSelectElement;
    dropdown.value = "EA 4";
    dropdown.dispatchEvent(new Event("change"));

    expect(onSelect).toHaveBeenCalledWith("EA 4");
  });

  it("should call onCancel when Cancel button is clicked", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    cancelButton.click();

    expect(onCancel).toHaveBeenCalled();
  });

  it("should call onCancel when Escape key is pressed", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(onCancel).toHaveBeenCalled();
  });

  it("should move focus to first suggestion button when dialog opens", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    expect(document.activeElement).toBe(firstButton);
  });

  it("should handle Arrow key navigation between buttons", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    firstButton.focus();

    const arrowDownEvent = new KeyboardEvent("keydown", { key: "ArrowDown" });
    firstButton.dispatchEvent(arrowDownEvent);

    const secondButton = content.querySelectorAll("button.suggestion-button")[1] as HTMLButtonElement;
    expect(document.activeElement).toBe(secondButton);
  });

  it("should close dialog after selection", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    firstButton.click();

    expect(dialog.style.display).toBe("none");
  });

  it("should close dialog after cancel", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    cancelButton.click();

    expect(dialog.style.display).toBe("none");
  });

  describe("Enhanced context display", () => {
    it("should display live events count, prospect events count, and total allocations", () => {
      const enhancedSuggestions: ReallocationSuggestion[] = [
        {
          fromAmbassador: "Current EA",
          toAmbassador: "EA 1",
          items: ["test-event"],
          score: 980,
          liveEventsCount: 2,
          prospectEventsCount: 1,
          allocationCount: 3,
          reasons: ["Has available capacity"],
        },
      ];

      showReallocationDialog("test-event", "Current EA", enhancedSuggestions, eventAmbassadors, undefined, onSelect, onCancel);

      const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
      expect(firstButton.textContent).toContain("2 live");
      expect(firstButton.textContent).toContain("1 prospect");
      expect(firstButton.textContent).toContain("3 total");
    });

    it("should display REA name when available", () => {
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["REA 1", { name: "REA 1", state: "VIC", supportsEAs: ["EA 1"] }],
      ]);

      const enhancedSuggestions: ReallocationSuggestion[] = [
        {
          fromAmbassador: "Current EA",
          toAmbassador: "EA 1",
          items: ["test-event"],
          score: 980,
          liveEventsCount: 2,
          prospectEventsCount: 0,
          allocationCount: 2,
        },
      ];

      showReallocationDialog("test-event", "Current EA", enhancedSuggestions, eventAmbassadors, regionalAmbassadors, onSelect, onCancel);

      const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
      expect(firstButton.textContent).toContain("REA: REA 1");
    });

    it("should display 'Unassigned' when REA is missing", () => {
      const regionalAmbassadors: RegionalAmbassadorMap = new Map();

      const enhancedSuggestions: ReallocationSuggestion[] = [
        {
          fromAmbassador: "Current EA",
          toAmbassador: "EA 1",
          items: ["test-event"],
          score: 980,
          liveEventsCount: 2,
          prospectEventsCount: 0,
          allocationCount: 2,
        },
      ];

      showReallocationDialog("test-event", "Current EA", enhancedSuggestions, eventAmbassadors, regionalAmbassadors, onSelect, onCancel);

      const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
      expect(firstButton.textContent).toContain("REA: Unassigned");
    });

    it("should display distance to nearest event in correct format", () => {
      const enhancedSuggestions: ReallocationSuggestion[] = [
        {
          fromAmbassador: "Current EA",
          toAmbassador: "EA 1",
          items: ["test-event"],
          score: 980,
          liveEventsCount: 2,
          prospectEventsCount: 0,
          allocationCount: 2,
          neighboringEvents: [
            { name: "Armstrong Creek", distanceKm: 5.2 },
          ],
        },
      ];

      showReallocationDialog("test-event", "Current EA", enhancedSuggestions, eventAmbassadors, undefined, onSelect, onCancel);

      const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
      expect(firstButton.textContent).toContain("5.2 km to Armstrong Creek");
    });

    it("should display 'No events assigned' when EA has no events", () => {
      const enhancedSuggestions: ReallocationSuggestion[] = [
        {
          fromAmbassador: "Current EA",
          toAmbassador: "EA 1",
          items: ["test-event"],
          score: 1000,
          liveEventsCount: 0,
          prospectEventsCount: 0,
          allocationCount: 0,
        },
      ];

      showReallocationDialog("test-event", "Current EA", enhancedSuggestions, eventAmbassadors, undefined, onSelect, onCancel);

      const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
      expect(firstButton.textContent).toContain("No events assigned");
    });

    it("should include enhanced context in aria-label", () => {
      const regionalAmbassadors: RegionalAmbassadorMap = new Map([
        ["REA 1", { name: "REA 1", state: "VIC", supportsEAs: ["EA 1"] }],
      ]);

      const enhancedSuggestions: ReallocationSuggestion[] = [
        {
          fromAmbassador: "Current EA",
          toAmbassador: "EA 1",
          items: ["test-event"],
          score: 980,
          liveEventsCount: 2,
          prospectEventsCount: 1,
          allocationCount: 3,
          neighboringEvents: [
            { name: "Armstrong Creek", distanceKm: 5.2 },
          ],
          reasons: ["Has available capacity"],
        },
      ];

      showReallocationDialog("test-event", "Current EA", enhancedSuggestions, eventAmbassadors, regionalAmbassadors, onSelect, onCancel);

      const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
      const ariaLabel = firstButton.getAttribute("aria-label");
      expect(ariaLabel).toContain("2 live events");
      expect(ariaLabel).toContain("1 prospect events");
      expect(ariaLabel).toContain("3 total allocations");
      expect(ariaLabel).toContain("REA: REA 1");
      expect(ariaLabel).toContain("5.2 km to Armstrong Creek");
    });
  });
});
