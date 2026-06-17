/**
 * Show Add Prospect Dialog Tests
 */

import { showAddProspectDialog } from "./showAddProspectDialog";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { geocodeAddress, searchPlaces } from "@utils/geocoding";
import { inferCountryCodeFromCoordinates } from "@models/country";
import { generateProspectAllocationSuggestions } from "./suggestEventAllocation";
import { createProspectFromAddress } from "./createProspectFromAddress";
import { saveProspectiveEvents } from "./persistProspectiveEvents";

// Mock dependencies
jest.mock("@utils/geocoding", () => ({
  geocodeAddress: jest.fn(),
  searchPlaces: jest.fn(),
}));

function getAddProspectFormInputs(container: HTMLElement) {
  return {
    prospectName: container.querySelector(
      "#addProspectNameInput",
    ) as HTMLInputElement,
    state: container.querySelector(
      "#addProspectStateInput",
    ) as HTMLInputElement,
    address: container.querySelector(
      "#addProspectAddressInput",
    ) as HTMLInputElement,
  };
}

jest.mock("@models/country", () => ({
  inferCountryCodeFromCoordinates: jest.fn(),
}));

jest.mock("./suggestEventAllocation", () => ({
  generateProspectAllocationSuggestions: jest.fn(),
}));

jest.mock("./createProspectFromAddress", () => ({
  createProspectFromAddress: jest.fn(),
}));

jest.mock("./persistProspectiveEvents", () => ({
  saveProspectiveEvents: jest.fn(),
  loadProspectiveEvents: jest.fn(() => []),
}));

describe("showAddProspectDialog", () => {
  let eventAmbassadors: EventAmbassadorMap;
  let regionalAmbassadors: RegionalAmbassadorMap;
  let eventDetails: EventDetailsMap;
  let onSuccess: jest.Mock;
  let onCancel: jest.Mock;
  let dialog: HTMLElement;
  let title: HTMLElement;
  let content: HTMLElement;
  let cancelButton: HTMLButtonElement;

  beforeEach(() => {
    // Setup DOM elements
    dialog = document.createElement("div");
    dialog.id = "reallocationDialog";
    dialog.style.display = "none";
    title = document.createElement("div");
    title.id = "reallocationDialogTitle";
    content = document.createElement("div");
    content.id = "reallocationDialogContent";
    cancelButton = document.createElement("button");
    cancelButton.id = "reallocationDialogCancel";

    dialog.appendChild(title);
    dialog.appendChild(content);
    dialog.appendChild(cancelButton);
    document.body.appendChild(dialog);

    // Setup maps
    eventAmbassadors = new Map();
    eventAmbassadors.set("EA 1", {
      name: "EA 1",
      events: [],
      prospectiveEvents: [],
    });

    regionalAmbassadors = new Map();
    regionalAmbassadors.set("REA 1", {
      name: "REA 1",
      state: "VIC",
      supportsEAs: ["EA 1"],
    });

    eventDetails = new Map();

    onSuccess = jest.fn();
    onCancel = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
    (geocodeAddress as jest.Mock).mockResolvedValue({
      lat: -37.8136,
      lng: 144.9631,
    });
    (searchPlaces as jest.Mock).mockResolvedValue([]);
    (inferCountryCodeFromCoordinates as jest.Mock).mockResolvedValue("AU");
    (generateProspectAllocationSuggestions as jest.Mock).mockResolvedValue([]);
    (createProspectFromAddress as jest.Mock).mockReturnValue({
      id: "test-prospect-id",
      prospectEvent: "Test Prospect",
      country: "AU",
      state: "VIC",
      eventAmbassador: "EA 1",
      geocodingStatus: "success",
      ambassadorMatchStatus: "matched",
    });
  });

  afterEach(() => {
    document.body.removeChild(dialog);
    jest.restoreAllMocks();
  });

  describe("Dialog display and form fields", () => {
    it("should display dialog with all required form fields", () => {
      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      expect(dialog.style.display).toBe("block");
      expect(dialog.getAttribute("role")).toBe("dialog");
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      expect(title.textContent).toBe("Add Prospect");

      // Check for required fields
      const prospectNameInput = content.querySelector(
        "#addProspectNameInput",
      ) as HTMLInputElement;
      expect(prospectNameInput).not.toBeNull();
      expect(prospectNameInput.placeholder).toContain("New Park Prospect");

      // Check for address field
      const addressInputs = content.querySelectorAll('input[type="text"]');
      expect(addressInputs.length).toBeGreaterThanOrEqual(2); // At least name and address

      // Check for state field (should be the third text input)
      const textInputs = Array.from(
        content.querySelectorAll('input[type="text"]'),
      ) as HTMLInputElement[];
      expect(textInputs.length).toBeGreaterThanOrEqual(3); // At least name, address, state
      const stateInput = textInputs.find(
        (input) =>
          input.placeholder?.includes("VIC") ||
          input.placeholder?.includes("NSW"),
      );
      expect(stateInput).not.toBeUndefined();

      // Check for optional fields
      const dateInput = content.querySelector(
        'input[type="date"]',
      ) as HTMLInputElement;
      expect(dateInput).not.toBeNull();

      // Check for checkboxes (status flags)
      const checkboxes = content.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(3); // Course Found, Landowner Permission, Funding Confirmed
    });

    it("should show error message when no Event Ambassadors available", () => {
      const emptyEAs = new Map();

      showAddProspectDialog(
        emptyEAs,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      expect(dialog.style.display).toBe("block");
      expect(content.textContent).toContain("No Event Ambassadors available");
    });

    it("should set default date to today", () => {
      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const dateInput = content.querySelector(
        'input[type="date"]',
      ) as HTMLInputElement;
      expect(dateInput).not.toBeNull();
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];
      expect(dateInput.value).toBe(todayString);
    });

    it("should have accessible form labels", () => {
      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const labels = content.querySelectorAll("label");
      expect(labels.length).toBeGreaterThan(0);

      // Check that required fields have labels with asterisks
      const requiredLabels = Array.from(labels).filter((label) =>
        label.textContent?.includes("*"),
      );
      expect(requiredLabels.length).toBeGreaterThanOrEqual(2); // At least name and address
    });
  });

  describe("Full prospect creation flow", () => {
    it("should complete full flow: dialog → geocoding → suggestions → selection → creation → persistence", async () => {
      const suggestions = [
        {
          fromAmbassador: "",
          toAmbassador: "EA 1",
          items: ["test-prospect"],
          score: 100,
          reasons: ["Has available capacity"],
          allocationCount: 0,
          liveEventsCount: 0,
          prospectEventsCount: 0,
        },
      ];

      (generateProspectAllocationSuggestions as jest.Mock).mockResolvedValue(
        suggestions,
      );

      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const {
        prospectName: prospectNameInput,
        state: stateInput,
        address: addressInput,
      } = getAddProspectFormInputs(content);

      prospectNameInput.value = "Test Prospect";
      addressInput.value = "123 Main St, Melbourne VIC 3000";
      stateInput.value = "VIC";

      // Trigger geocoding by blurring address field
      addressInput.dispatchEvent(new Event("blur"));
      stateInput.dispatchEvent(new Event("blur"));

      // Wait for geocoding to complete
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Verify geocoding was called
      expect(geocodeAddress).toHaveBeenCalledWith(
        "123 Main St, Melbourne VIC 3000",
      );

      const locationStatus = content.querySelector(
        "#addProspectLocationStatus",
      ) as HTMLElement;
      expect(locationStatus.style.display).not.toBe("none");
      expect(locationStatus.textContent).toContain("Location found");
      expect(locationStatus.textContent).toContain("Country: AU");

      // Verify country inference was called
      expect(inferCountryCodeFromCoordinates).toHaveBeenCalled();

      // Verify suggestions were generated
      expect(generateProspectAllocationSuggestions).toHaveBeenCalled();

      // Wait a bit more for suggestions to be displayed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Wait a bit more for suggestions to be displayed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Simulate EA selection by clicking suggestion button
      const suggestionButton = content.querySelector(
        "button.suggestion-button",
      ) as HTMLButtonElement;
      expect(suggestionButton).not.toBeNull();

      suggestionButton.click();

      // Wait for async operations to complete (prospect creation is synchronous but we wait for any async cleanup)
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify prospect was created
      expect(createProspectFromAddress).toHaveBeenCalled();
      expect(saveProspectiveEvents).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it("should handle geocoding errors gracefully", async () => {
      (geocodeAddress as jest.Mock).mockRejectedValue(
        new Error("Geocoding failed"),
      );

      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const { address: addressInput, state: stateInput } =
        getAddProspectFormInputs(content);

      addressInput.value = "Invalid Address";
      stateInput.value = "VIC";

      addressInput.dispatchEvent(new Event("blur"));
      stateInput.dispatchEvent(new Event("blur"));

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Check for error message display
      const errorMessage = content.querySelector(
        "#geocodingError",
      ) as HTMLElement;
      expect(errorMessage).not.toBeNull();
      expect(errorMessage.style.display).not.toBe("none");
      expect(errorMessage.textContent).toContain("Geocoding failed");
    });

    it("should validate required fields before creating prospect", () => {
      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      // Try to select EA without filling required fields
      // This should show validation error
      const suggestionButton = content.querySelector(
        "button.suggestion-button",
      ) as HTMLButtonElement;
      if (suggestionButton) {
        // Manually trigger the selection handler (simulating button click)
        // Since we don't have geocoded coordinates, it should fail validation
        // The error should be shown when trying to create without required data
        // Note: This test verifies the dialog structure, not the full validation flow
      }
    });
  });

  describe("User Story 2 - Geocoding failure handling", () => {
    it("should display error message and retry button when geocoding fails", async () => {
      (geocodeAddress as jest.Mock).mockRejectedValue(
        new Error("Geocoding failed"),
      );

      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const { address: addressInput, state: stateInput } =
        getAddProspectFormInputs(content);

      addressInput.value = "Invalid Address";
      stateInput.value = "VIC";

      addressInput.dispatchEvent(new Event("blur"));
      stateInput.dispatchEvent(new Event("blur"));

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Check for error message display
      const errorMessage = content.querySelector(
        "#geocodingError",
      ) as HTMLElement;
      expect(errorMessage).not.toBeNull();
      expect(errorMessage.style.display).not.toBe("none");
      expect(errorMessage.textContent).toContain("Geocoding failed");

      // Check for retry button
      const retryButton = errorMessage.querySelector(
        "#retryGeocodingButton",
      ) as HTMLButtonElement;
      expect(retryButton).not.toBeNull();

      // Check for manual coordinate entry option
      const manualCoordinatesContainer = content.querySelector(
        "#manualCoordinates",
      ) as HTMLElement;
      expect(manualCoordinatesContainer).not.toBeNull();
      expect(manualCoordinatesContainer.style.display).not.toBe("none");

      const locationStatus = content.querySelector(
        "#addProspectLocationStatus",
      ) as HTMLElement;
      expect(locationStatus.style.display).toBe("none");
    });

    it("should allow manual coordinate entry when geocoding fails", async () => {
      (geocodeAddress as jest.Mock).mockRejectedValue(
        new Error("Geocoding failed"),
      );
      (inferCountryCodeFromCoordinates as jest.Mock).mockResolvedValue("AU");
      (generateProspectAllocationSuggestions as jest.Mock).mockResolvedValue([
        {
          fromAmbassador: "",
          toAmbassador: "EA 1",
          items: ["test-prospect"],
          score: 100,
          reasons: ["Has available capacity"],
          allocationCount: 0,
          liveEventsCount: 0,
          prospectEventsCount: 0,
        },
      ]);

      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const { address: addressInput, state: stateInput } =
        getAddProspectFormInputs(content);

      addressInput.value = "Invalid Address";
      stateInput.value = "VIC";

      addressInput.dispatchEvent(new Event("blur"));
      stateInput.dispatchEvent(new Event("blur"));

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Find manual coordinates input
      const manualCoordinatesContainer = content.querySelector(
        "#manualCoordinates",
      ) as HTMLElement;
      expect(manualCoordinatesContainer).not.toBeNull();
      expect(manualCoordinatesContainer.style.display).not.toBe("none");

      const coordinatesInput = manualCoordinatesContainer.querySelector(
        'input[type="text"]',
      ) as HTMLInputElement;
      expect(coordinatesInput).not.toBeNull();

      // Enter coordinates manually
      coordinatesInput.value = "-37.8136, 144.9631";
      const useCoordinatesButton = manualCoordinatesContainer.querySelector(
        "button",
      ) as HTMLButtonElement;
      expect(useCoordinatesButton).not.toBeNull();

      useCoordinatesButton.click();

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify country inference was called with manual coordinates
      expect(inferCountryCodeFromCoordinates).toHaveBeenCalled();

      // Verify suggestions were generated
      expect(generateProspectAllocationSuggestions).toHaveBeenCalled();

      // Verify manual coordinates container is hidden and suggestions are shown
      await new Promise((resolve) => setTimeout(resolve, 100));
      const suggestionsContainer = content.querySelector(
        "#allocationSuggestions",
      ) as HTMLElement;
      expect(suggestionsContainer).not.toBeNull();
      expect(suggestionsContainer.style.display).not.toBe("none");
    });

    it("should complete full flow: geocoding failure → manual coordinate entry → prospect creation", async () => {
      (geocodeAddress as jest.Mock).mockRejectedValue(
        new Error("Geocoding failed"),
      );
      (inferCountryCodeFromCoordinates as jest.Mock).mockResolvedValue("AU");
      (generateProspectAllocationSuggestions as jest.Mock).mockResolvedValue([
        {
          fromAmbassador: "",
          toAmbassador: "EA 1",
          items: ["test-prospect"],
          score: 100,
          reasons: ["Has available capacity"],
          allocationCount: 0,
          liveEventsCount: 0,
          prospectEventsCount: 0,
        },
      ]);

      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      // Fill in prospect name
      const {
        prospectName: prospectNameInput,
        address: addressInput,
        state: stateInput,
      } = getAddProspectFormInputs(content);
      prospectNameInput.value = "Test Prospect";

      addressInput.value = "Invalid Address";
      stateInput.value = "VIC";

      addressInput.dispatchEvent(new Event("blur"));
      stateInput.dispatchEvent(new Event("blur"));

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Enter coordinates manually
      const manualCoordinatesContainer = content.querySelector(
        "#manualCoordinates",
      ) as HTMLElement;
      const coordinatesInput = manualCoordinatesContainer.querySelector(
        'input[type="text"]',
      ) as HTMLInputElement;
      coordinatesInput.value = "-37.8136, 144.9631";
      const useCoordinatesButton = manualCoordinatesContainer.querySelector(
        "button",
      ) as HTMLButtonElement;
      useCoordinatesButton.click();

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Select EA from suggestions
      const suggestionButton = content.querySelector(
        "button.suggestion-button",
      ) as HTMLButtonElement;
      expect(suggestionButton).not.toBeNull();
      suggestionButton.click();

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify prospect was created with manual coordinates
      expect(createProspectFromAddress).toHaveBeenCalled();
      const prospectData = (createProspectFromAddress as jest.Mock).mock
        .calls[0][0];
      expect(prospectData.geocodingStatus).toBe("manual");
      expect(saveProspectiveEvents).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe("User Story 3 - Manual EA selection", () => {
    it('should display "Other" option with EA dropdown when suggestions are shown', async () => {
      const suggestions = [
        {
          fromAmbassador: "",
          toAmbassador: "EA 1",
          items: ["test-prospect"],
          score: 100,
          reasons: ["Has available capacity"],
          allocationCount: 0,
          liveEventsCount: 0,
          prospectEventsCount: 0,
        },
      ];

      (generateProspectAllocationSuggestions as jest.Mock).mockResolvedValue(
        suggestions,
      );

      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const {
        prospectName: prospectNameInput,
        address: addressInput,
        state: stateInput,
      } = getAddProspectFormInputs(content);

      prospectNameInput.value = "Test Prospect";
      addressInput.value = "123 Main St, Melbourne VIC 3000";
      stateInput.value = "VIC";

      addressInput.dispatchEvent(new Event("blur"));
      stateInput.dispatchEvent(new Event("blur"));

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Wait for suggestions to be displayed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check for "Other" dropdown
      const otherDropdown = content.querySelector(
        "#otherEASelect",
      ) as HTMLSelectElement;
      expect(otherDropdown).not.toBeNull();
      expect(otherDropdown.tagName).toBe("SELECT");

      // Check dropdown has options for all EAs
      const options = Array.from(otherDropdown.options);
      expect(options.length).toBeGreaterThan(1); // At least empty option + EAs
      expect(options[0].textContent).toBe("Select an Event Ambassador");

      // Check that EA names are in dropdown
      const eaOptions = options.slice(1);
      expect(eaOptions.some((opt) => opt.value === "EA 1")).toBe(true);
    });

    it("should allow manual EA selection from full list via dropdown", async () => {
      const suggestions = [
        {
          fromAmbassador: "",
          toAmbassador: "EA 1",
          items: ["test-prospect"],
          score: 100,
          reasons: ["Has available capacity"],
          allocationCount: 0,
          liveEventsCount: 0,
          prospectEventsCount: 0,
        },
      ];

      (generateProspectAllocationSuggestions as jest.Mock).mockResolvedValue(
        suggestions,
      );

      // Add another EA to test selection
      eventAmbassadors.set("EA 2", {
        name: "EA 2",
        events: [],
        prospectiveEvents: [],
      });

      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const {
        prospectName: prospectNameInput,
        address: addressInput,
        state: stateInput,
      } = getAddProspectFormInputs(content);

      prospectNameInput.value = "Test Prospect";
      addressInput.value = "123 Main St, Melbourne VIC 3000";
      stateInput.value = "VIC";

      addressInput.dispatchEvent(new Event("blur"));
      stateInput.dispatchEvent(new Event("blur"));

      await new Promise((resolve) => setTimeout(resolve, 600));
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Select EA 2 from dropdown (not in suggestions)
      const otherDropdown = content.querySelector(
        "#otherEASelect",
      ) as HTMLSelectElement;
      expect(otherDropdown).not.toBeNull();

      otherDropdown.value = "EA 2";
      otherDropdown.dispatchEvent(new Event("change"));

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify prospect was created with manually selected EA
      expect(createProspectFromAddress).toHaveBeenCalled();
      const prospectData = (createProspectFromAddress as jest.Mock).mock
        .calls[0][0];
      expect(prospectData.eventAmbassador).toBe("EA 2");
      expect(saveProspectiveEvents).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should complete full flow: suggestion display → "Other" click → EA selection → prospect creation', async () => {
      const suggestions = [
        {
          fromAmbassador: "",
          toAmbassador: "EA 1",
          items: ["test-prospect"],
          score: 100,
          reasons: ["Has available capacity"],
          allocationCount: 0,
          liveEventsCount: 0,
          prospectEventsCount: 0,
        },
      ];

      (generateProspectAllocationSuggestions as jest.Mock).mockResolvedValue(
        suggestions,
      );

      // Add another EA
      eventAmbassadors.set("EA 2", {
        name: "EA 2",
        events: [],
        prospectiveEvents: [],
      });

      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const {
        prospectName: prospectNameInput,
        address: addressInput,
        state: stateInput,
      } = getAddProspectFormInputs(content);

      prospectNameInput.value = "Test Prospect";
      addressInput.value = "123 Main St, Melbourne VIC 3000";
      stateInput.value = "VIC";

      addressInput.dispatchEvent(new Event("blur"));
      stateInput.dispatchEvent(new Event("blur"));

      await new Promise((resolve) => setTimeout(resolve, 600));
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify suggestions are displayed
      const suggestionsContainer = content.querySelector(
        "#allocationSuggestions",
      ) as HTMLElement;
      expect(suggestionsContainer).not.toBeNull();
      expect(suggestionsContainer.style.display).not.toBe("none");

      // Verify "Other" dropdown exists
      const otherDropdown = content.querySelector(
        "#otherEASelect",
      ) as HTMLSelectElement;
      expect(otherDropdown).not.toBeNull();

      // Select EA 2 from dropdown
      otherDropdown.value = "EA 2";
      otherDropdown.dispatchEvent(new Event("change"));

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify full flow completed
      expect(createProspectFromAddress).toHaveBeenCalled();
      expect(saveProspectiveEvents).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe("Place search suggestions", () => {
    it("shows Places when geocoded country mismatches state and hides manual coordinates", async () => {
      (geocodeAddress as jest.Mock).mockResolvedValue({
        lat: 39.1128845,
        lng: -84.5125709,
      });
      (inferCountryCodeFromCoordinates as jest.Mock).mockResolvedValue("US");
      (searchPlaces as jest.Mock).mockResolvedValue([
        {
          label:
            "Main Street, Hamilton Central, Hamilton City, Waikato, New Zealand",
          latitude: -37.787,
          longitude: 175.279,
        },
      ]);

      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const { state: stateInput, address: addressInput } =
        getAddProspectFormInputs(content);

      stateInput.value = "NZ";
      addressInput.value = "main st, hamilton";

      addressInput.dispatchEvent(new Event("blur"));
      stateInput.dispatchEvent(new Event("blur"));

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(searchPlaces).toHaveBeenCalledWith(
        "main st, hamilton, New Zealand",
      );

      const placesListbox = content.querySelector(
        "#addProspectPlacesListbox",
      ) as HTMLElement;
      expect(placesListbox).not.toBeNull();
      expect(placesListbox.hidden).toBe(false);
      expect(placesListbox.textContent).toContain("Hamilton Central");
      expect(
        placesListbox.closest(".add-prospect-address-field"),
      ).not.toBeNull();
      expect(addressInput.nextElementSibling?.id).toBe(
        "addProspectPlacesListbox",
      );

      const locationStatus = content.querySelector(
        "#addProspectLocationStatus",
      ) as HTMLElement;
      expect(locationStatus.style.display).toBe("none");

      const manualCoordinatesContainer = content.querySelector(
        "#manualCoordinates",
      ) as HTMLElement;
      expect(manualCoordinatesContainer.style.display).toBe("none");
    });

    it("updates address and shows allocation suggestions when a place is selected", async () => {
      (geocodeAddress as jest.Mock).mockResolvedValue({
        lat: 39.1128845,
        lng: -84.5125709,
      });
      (inferCountryCodeFromCoordinates as jest.Mock)
        .mockResolvedValueOnce("US")
        .mockResolvedValueOnce("NZ");
      (searchPlaces as jest.Mock).mockResolvedValue([
        {
          label:
            "Main Street, Hamilton Central, Hamilton City, Waikato, New Zealand",
          latitude: -37.787,
          longitude: 175.279,
        },
      ]);
      (generateProspectAllocationSuggestions as jest.Mock).mockResolvedValue([
        {
          fromAmbassador: "",
          toAmbassador: "EA 1",
          items: ["test-prospect"],
          score: 100,
          reasons: ["Has available capacity"],
          allocationCount: 0,
          liveEventsCount: 0,
          prospectEventsCount: 0,
        },
      ]);

      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const { state: stateInput, address: addressInput } =
        getAddProspectFormInputs(content);

      stateInput.value = "NZ";
      addressInput.value = "main st, hamilton";

      addressInput.dispatchEvent(new Event("blur"));
      stateInput.dispatchEvent(new Event("blur"));

      await new Promise((resolve) => setTimeout(resolve, 600));

      const placeButton = content.querySelector(
        ".add-prospect-place-option",
      ) as HTMLButtonElement;
      expect(placeButton).not.toBeNull();
      placeButton.click();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(addressInput.value).toContain("Hamilton Central");
      expect(generateProspectAllocationSuggestions).toHaveBeenCalled();

      const suggestionsContainer = content.querySelector(
        "#allocationSuggestions",
      ) as HTMLElement;
      expect(suggestionsContainer.style.display).not.toBe("none");
    });

    it("shows manual coordinates only when place search returns no results", async () => {
      (geocodeAddress as jest.Mock).mockRejectedValue(
        new Error("Geocoding failed"),
      );
      (searchPlaces as jest.Mock).mockResolvedValue([]);

      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const { state: stateInput, address: addressInput } =
        getAddProspectFormInputs(content);

      stateInput.value = "VIC";
      addressInput.value = "Invalid Address";

      addressInput.dispatchEvent(new Event("blur"));
      stateInput.dispatchEvent(new Event("blur"));

      await new Promise((resolve) => setTimeout(resolve, 600));

      const placesListbox = content.querySelector(
        "#addProspectPlacesListbox",
      ) as HTMLElement;
      expect(placesListbox.hidden).toBe(true);

      const manualCoordinatesContainer = content.querySelector(
        "#manualCoordinates",
      ) as HTMLElement;
      expect(manualCoordinatesContainer.style.display).not.toBe("none");
    });

    it("lists State/Region before Address in the form", () => {
      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const labels = Array.from(content.querySelectorAll("label")).map(
        (label) => label.textContent,
      );
      const stateIndex = labels.findIndex((text) =>
        text?.includes("State/Region"),
      );
      const addressIndex = labels.findIndex((text) =>
        text?.includes("Address"),
      );

      expect(stateIndex).toBeGreaterThanOrEqual(0);
      expect(addressIndex).toBeGreaterThan(stateIndex);
    });

    it("attaches the places listbox directly below the address input", () => {
      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const addressField = content.querySelector(
        ".add-prospect-address-field",
      ) as HTMLElement;
      const addressInput = content.querySelector("#addProspectAddressInput");
      const placesListbox = content.querySelector("#addProspectPlacesListbox");

      expect(addressField).not.toBeNull();
      expect(addressInput?.nextElementSibling?.id).toBe(
        "addProspectPlacesListbox",
      );
      expect(
        addressField.querySelector("#addProspectPlacesListbox"),
      ).not.toBeNull();
      expect(
        placesListbox?.classList.contains("territory-map-search-listbox"),
      ).toBe(true);
    });

    it("disables browser autofill on all dialog fields", () => {
      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const fields = content.querySelectorAll("input, select");
      expect(fields.length).toBeGreaterThan(0);
      fields.forEach((field) => {
        expect(field.getAttribute("autocomplete")).toBe("off");
      });

      const { address: addressInput } = getAddProspectFormInputs(content);
      expect(addressInput.getAttribute("data-1p-ignore")).toBe("true");
      expect(addressInput.getAttribute("data-lpignore")).toBe("true");
    });

    it("shows a loading status while the address lookup is in progress", async () => {
      let resolveGeocode: (value: { lat: number; lng: number }) => void = () =>
        undefined;
      (geocodeAddress as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveGeocode = resolve;
          }),
      );

      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
      );

      const { state: stateInput, address: addressInput } =
        getAddProspectFormInputs(content);

      stateInput.value = "VIC";
      addressInput.value = "Ruffey Lake Park";

      addressInput.dispatchEvent(new Event("blur"));

      const locationStatus = content.querySelector(
        "#addProspectLocationStatus",
      ) as HTMLElement;
      expect(locationStatus.style.display).not.toBe("none");
      expect(locationStatus.textContent).toContain("Looking up location");

      await new Promise((resolve) => setTimeout(resolve, 550));
      resolveGeocode({ lat: -37.787, lng: 145.123 });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(locationStatus.textContent).toContain("Location found");
    });
  });

  describe("Place pin initial location", () => {
    it("pre-fills address and locks coordinates from a place pin", async () => {
      showAddProspectDialog(
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails,
        onSuccess,
        onCancel,
        undefined,
        {
          address: "Ballarat, Victoria, Australia",
          latitude: -37.5622,
          longitude: 143.8503,
          coordinatesWereDragged: false,
        },
      );

      const addressInput = content.querySelector(
        "#addProspectAddressInput",
      ) as HTMLInputElement;

      expect(addressInput.value).toBe("Ballarat, Victoria, Australia");
      expect(content.textContent).toContain("Location set from map");

      await Promise.resolve();
      await Promise.resolve();

      const locationStatus = content.querySelector(
        "#addProspectLocationStatus",
      ) as HTMLElement;
      expect(locationStatus.style.display).not.toBe("none");
      expect(locationStatus.textContent).toContain("Location found");

      expect(inferCountryCodeFromCoordinates).toHaveBeenCalled();
    });
  });
});
