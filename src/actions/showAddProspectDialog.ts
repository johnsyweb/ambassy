/**
 * Show Add Prospect Dialog
 *
 * Displays a dialog for adding a new prospect by entering an address.
 * Handles geocoding, country inference, EA suggestions, and prospect creation.
 */

import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { geocodeAddress } from "@utils/geocoding";
import { createCoordinate } from "@models/Coordinate";
import { inferCountryCodeFromCoordinates } from "@models/country";
import { generateProspectAllocationSuggestions } from "./suggestEventAllocation";
import { createProspectFromAddress } from "./createProspectFromAddress";
import { saveProspectiveEvents, loadProspectiveEvents } from "./persistProspectiveEvents";
import { LogEntry } from "@models/LogEntry";
import { ProspectiveEventList } from "@models/ProspectiveEventList";

export function showAddProspectDialog(
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventDetails: EventDetailsMap,
  onSuccess: () => void,
  onCancel: () => void,
  log?: LogEntry[]
): void {
  const dialog = document.getElementById("reallocationDialog") as HTMLElement;
  const title = document.getElementById("reallocationDialogTitle") as HTMLElement;
  const content = document.getElementById("reallocationDialogContent") as HTMLElement;
  const cancelButton = document.getElementById("reallocationDialogCancel") as HTMLButtonElement;

  if (!dialog || !title || !content || !cancelButton) {
    console.error("Dialog elements not found");
    return;
  }

  if (eventAmbassadors.size === 0) {
    title.textContent = "Add Prospect";
    content.innerHTML = `
      <p style="color: #d32f2f; font-weight: bold;">
        No Event Ambassadors available. Please onboard an Event Ambassador first.
      </p>
    `;
    dialog.style.display = "block";
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-labelledby", "reallocationDialogTitle");

    const handleCancel = () => {
      dialog.style.display = "none";
      cancelButton.removeEventListener("click", handleCancel);
      onCancel();
    };

    cancelButton.addEventListener("click", handleCancel);
    return;
  }

  title.textContent = "Add Prospect";
  content.innerHTML = "";

  const container = document.createElement("div");
  container.style.padding = "1em";

  // Required fields
  const prospectNameLabel = document.createElement("label");
  prospectNameLabel.textContent = "Prospect Name: *";
  prospectNameLabel.style.display = "block";
  prospectNameLabel.style.marginBottom = "0.25em";
  prospectNameLabel.style.fontWeight = "bold";
  container.appendChild(prospectNameLabel);

  const prospectNameInput = document.createElement("input");
  prospectNameInput.type = "text";
  prospectNameInput.placeholder = "e.g., New Park Prospect";
  prospectNameInput.style.width = "100%";
  prospectNameInput.style.padding = "0.5em";
  prospectNameInput.style.marginBottom = "1em";
  prospectNameInput.style.border = "1px solid #ccc";
  prospectNameInput.style.borderRadius = "4px";
  container.appendChild(prospectNameInput);

  const addressLabel = document.createElement("label");
  addressLabel.textContent = "Address: *";
  addressLabel.style.display = "block";
  addressLabel.style.marginBottom = "0.25em";
  addressLabel.style.fontWeight = "bold";
  container.appendChild(addressLabel);

  const addressInput = document.createElement("input");
  addressInput.type = "text";
  addressInput.placeholder = "e.g., 123 Main St, Melbourne VIC 3000, Australia";
  addressInput.style.width = "100%";
  addressInput.style.padding = "0.5em";
  addressInput.style.marginBottom = "1em";
  addressInput.style.border = "1px solid #ccc";
  addressInput.style.borderRadius = "4px";
  container.appendChild(addressInput);

  const stateLabel = document.createElement("label");
  stateLabel.textContent = "State/Region: *";
  stateLabel.style.display = "block";
  stateLabel.style.marginBottom = "0.25em";
  stateLabel.style.fontWeight = "bold";
  container.appendChild(stateLabel);

  const stateInput = document.createElement("input");
  stateInput.type = "text";
  stateInput.placeholder = "e.g., VIC, NSW";
  stateInput.style.width = "100%";
  stateInput.style.padding = "0.5em";
  stateInput.style.marginBottom = "1em";
  stateInput.style.border = "1px solid #ccc";
  stateInput.style.borderRadius = "4px";
  container.appendChild(stateInput);

  // Optional fields
  const optionalFieldsLabel = document.createElement("p");
  optionalFieldsLabel.textContent = "Optional Fields:";
  optionalFieldsLabel.style.fontWeight = "bold";
  optionalFieldsLabel.style.marginTop = "1em";
  optionalFieldsLabel.style.marginBottom = "0.5em";
  container.appendChild(optionalFieldsLabel);

  const prospectEDsLabel = document.createElement("label");
  prospectEDsLabel.textContent = "Event Director(s):";
  prospectEDsLabel.style.display = "block";
  prospectEDsLabel.style.marginBottom = "0.25em";
  container.appendChild(prospectEDsLabel);

  const prospectEDsInput = document.createElement("input");
  prospectEDsInput.type = "text";
  prospectEDsInput.placeholder = "e.g., John Doe";
  prospectEDsInput.style.width = "100%";
  prospectEDsInput.style.padding = "0.5em";
  prospectEDsInput.style.marginBottom = "1em";
  prospectEDsInput.style.border = "1px solid #ccc";
  prospectEDsInput.style.borderRadius = "4px";
  container.appendChild(prospectEDsInput);

  const dateMadeContactLabel = document.createElement("label");
  dateMadeContactLabel.textContent = "Date Made Contact:";
  dateMadeContactLabel.style.display = "block";
  dateMadeContactLabel.style.marginBottom = "0.25em";
  container.appendChild(dateMadeContactLabel);

  const dateMadeContactInput = document.createElement("input");
  dateMadeContactInput.type = "date";
  // Set default value to today's date (YYYY-MM-DD format)
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  dateMadeContactInput.value = todayString;
  dateMadeContactInput.style.width = "100%";
  dateMadeContactInput.style.padding = "0.5em";
  dateMadeContactInput.style.marginBottom = "1em";
  dateMadeContactInput.style.border = "1px solid #ccc";
  dateMadeContactInput.style.borderRadius = "4px";
  container.appendChild(dateMadeContactInput);

  const statusFlagsContainer = document.createElement("div");
  statusFlagsContainer.style.marginBottom = "1em";
  statusFlagsContainer.style.display = "flex";
  statusFlagsContainer.style.flexDirection = "column";
  statusFlagsContainer.style.gap = "0.5em";

  const courseFoundLabel = document.createElement("label");
  courseFoundLabel.style.display = "flex";
  courseFoundLabel.style.alignItems = "center";
  courseFoundLabel.style.gap = "0.5em";
  const courseFoundCheckbox = document.createElement("input");
  courseFoundCheckbox.type = "checkbox";
  courseFoundLabel.appendChild(courseFoundCheckbox);
  courseFoundLabel.appendChild(document.createTextNode("Course Found"));
  statusFlagsContainer.appendChild(courseFoundLabel);

  const landownerPermissionLabel = document.createElement("label");
  landownerPermissionLabel.style.display = "flex";
  landownerPermissionLabel.style.alignItems = "center";
  landownerPermissionLabel.style.gap = "0.5em";
  const landownerPermissionCheckbox = document.createElement("input");
  landownerPermissionCheckbox.type = "checkbox";
  landownerPermissionLabel.appendChild(landownerPermissionCheckbox);
  landownerPermissionLabel.appendChild(document.createTextNode("Landowner Permission"));
  statusFlagsContainer.appendChild(landownerPermissionLabel);

  const fundingConfirmedLabel = document.createElement("label");
  fundingConfirmedLabel.style.display = "flex";
  fundingConfirmedLabel.style.alignItems = "center";
  fundingConfirmedLabel.style.gap = "0.5em";
  const fundingConfirmedCheckbox = document.createElement("input");
  fundingConfirmedCheckbox.type = "checkbox";
  fundingConfirmedLabel.appendChild(fundingConfirmedCheckbox);
  fundingConfirmedLabel.appendChild(document.createTextNode("Funding Confirmed"));
  statusFlagsContainer.appendChild(fundingConfirmedLabel);

  container.appendChild(statusFlagsContainer);

  // Loading indicator
  const loadingIndicator = document.createElement("div");
  loadingIndicator.id = "geocodingLoading";
  loadingIndicator.style.display = "none";
  loadingIndicator.style.marginBottom = "1em";
  loadingIndicator.style.padding = "0.5em";
  loadingIndicator.style.backgroundColor = "#e3f2fd";
  loadingIndicator.style.borderRadius = "4px";
  loadingIndicator.textContent = "Geocoding address...";
  container.appendChild(loadingIndicator);

  // Error message
  const errorMessage = document.createElement("div");
  errorMessage.id = "geocodingError";
  errorMessage.style.display = "none";
  errorMessage.style.color = "#d32f2f";
  errorMessage.style.marginBottom = "1em";
  errorMessage.style.padding = "0.5em";
  errorMessage.style.backgroundColor = "#ffebee";
  errorMessage.style.borderRadius = "4px";
  errorMessage.setAttribute("role", "alert");
  container.appendChild(errorMessage);

  // Duplicate warning message (initially hidden)
  const duplicateWarning = document.createElement("div");
  duplicateWarning.id = "duplicateWarning";
  duplicateWarning.style.display = "none";
  duplicateWarning.style.color = "#f57c00";
  duplicateWarning.style.marginBottom = "1em";
  duplicateWarning.style.padding = "0.5em";
  duplicateWarning.style.backgroundColor = "#fff3e0";
  duplicateWarning.style.borderRadius = "4px";
  duplicateWarning.style.border = "1px solid #ffb74d";
  duplicateWarning.setAttribute("role", "alert");
  duplicateWarning.setAttribute("aria-live", "polite");
  container.appendChild(duplicateWarning);

  // Manual coordinate entry section (initially hidden)
  const manualCoordinatesContainer = document.createElement("div");
  manualCoordinatesContainer.id = "manualCoordinates";
  manualCoordinatesContainer.style.display = "none";
  manualCoordinatesContainer.style.marginTop = "1em";
  manualCoordinatesContainer.style.padding = "1em";
  manualCoordinatesContainer.style.border = "1px solid #ccc";
  manualCoordinatesContainer.style.borderRadius = "4px";
  manualCoordinatesContainer.style.backgroundColor = "#f9f9f9";

  const manualCoordinatesLabel = document.createElement("p");
  manualCoordinatesLabel.textContent = "Enter Coordinates Manually:";
  manualCoordinatesLabel.style.fontWeight = "bold";
  manualCoordinatesLabel.style.marginBottom = "0.5em";
  manualCoordinatesContainer.appendChild(manualCoordinatesLabel);

  const coordinatesInputLabel = document.createElement("label");
  coordinatesInputLabel.textContent = "Coordinates (latitude, longitude):";
  coordinatesInputLabel.style.display = "block";
  coordinatesInputLabel.style.marginBottom = "0.25em";
  manualCoordinatesContainer.appendChild(coordinatesInputLabel);

  const coordinatesInput = document.createElement("input");
  coordinatesInput.type = "text";
  coordinatesInput.placeholder = "e.g., -37.8136, 144.9631";
  coordinatesInput.style.width = "100%";
  coordinatesInput.style.padding = "0.5em";
  coordinatesInput.style.marginBottom = "0.5em";
  coordinatesInput.style.border = "1px solid #ccc";
  coordinatesInput.style.borderRadius = "4px";
  manualCoordinatesContainer.appendChild(coordinatesInput);

  const manualCoordinatesError = document.createElement("div");
  manualCoordinatesError.style.display = "none";
  manualCoordinatesError.style.color = "#d32f2f";
  manualCoordinatesError.style.fontSize = "0.9em";
  manualCoordinatesError.style.marginBottom = "0.5em";
  manualCoordinatesError.setAttribute("role", "alert");
  manualCoordinatesContainer.appendChild(manualCoordinatesError);

  const useManualCoordinatesButton = document.createElement("button");
  useManualCoordinatesButton.type = "button";
  useManualCoordinatesButton.textContent = "Use These Coordinates";
  useManualCoordinatesButton.style.padding = "0.5em 1em";
  useManualCoordinatesButton.style.backgroundColor = "#28a745";
  useManualCoordinatesButton.style.color = "white";
  useManualCoordinatesButton.style.border = "none";
  useManualCoordinatesButton.style.borderRadius = "4px";
  useManualCoordinatesButton.style.cursor = "pointer";
  manualCoordinatesContainer.appendChild(useManualCoordinatesButton);

  container.appendChild(manualCoordinatesContainer);

  // Suggestions container (initially hidden)
  const suggestionsContainer = document.createElement("div");
  suggestionsContainer.id = "allocationSuggestions";
  suggestionsContainer.style.display = "none";
  suggestionsContainer.style.marginTop = "1em";
  suggestionsContainer.style.marginBottom = "1em";
  container.appendChild(suggestionsContainer);

  content.appendChild(container);

  // State tracking
  let geocodeTimeout: NodeJS.Timeout | null = null;
  let currentGeocodeAbort: AbortController | null = null;
  let geocodedCoordinates: { lat: number; lng: number } | null = null;
  let inferredCountry: string | null = null;
  let allocationSuggestions: ReallocationSuggestion[] = [];
  let lastGeocodedAddress = "";
  let coordinatesEnteredManually = false;

  // Geocoding function
  const performGeocoding = async (address: string, state: string) => {
    if (!address.trim() || !state.trim()) {
      return;
    }

    // Cancel any pending geocoding
    if (currentGeocodeAbort) {
      currentGeocodeAbort.abort();
    }

    // Show loading
    loadingIndicator.style.display = "block";
    errorMessage.style.display = "none";
    suggestionsContainer.style.display = "none";
    addressInput.disabled = true;
    stateInput.disabled = true;

    try {
      currentGeocodeAbort = new AbortController();
      const { lat, lng } = await geocodeAddress(address);
      const coordinates = createCoordinate(lat, lng);
      
      geocodedCoordinates = { lat, lng };
      
      // Infer country code (two-letter format like "AU" to match CSV imports)
      inferredCountry = await inferCountryCodeFromCoordinates(coordinates);
      
      // Handle country inference failure
      if (!inferredCountry || inferredCountry === "Unknown") {
        throw new Error("Could not determine country from coordinates. Please verify the address or enter coordinates manually.");
      }
      
      // Check for duplicate name now that we have country
      checkDuplicateName();
      
      // Generate allocation suggestions
      const prospectName = prospectNameInput.value.trim() || "New Prospect";
      allocationSuggestions = await generateProspectAllocationSuggestions(
        prospectName,
        coordinates,
        eventAmbassadors,
        eventDetails,
        regionalAmbassadors
      );

      // Hide loading, show suggestions
      loadingIndicator.style.display = "none";
      displayAllocationSuggestions();

      lastGeocodedAddress = address;
      coordinatesEnteredManually = false; // Reset manual flag on successful geocoding
    } catch (error) {
      loadingIndicator.style.display = "none";
      errorMessage.innerHTML = `
        ${error instanceof Error ? error.message : "Geocoding failed"}
        <br>
        <button type="button" id="retryGeocodingButton" style="margin-top: 0.5em; padding: 0.25em 0.5em; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Retry Geocoding
        </button>
      `;
      errorMessage.style.display = "block";
      geocodedCoordinates = null;
      inferredCountry = null;
      allocationSuggestions = [];
      
      // Show manual coordinate entry option
      manualCoordinatesContainer.style.display = "block";
      
      // Add retry button handler
      const retryButton = errorMessage.querySelector("#retryGeocodingButton") as HTMLButtonElement;
      if (retryButton) {
        retryButton.addEventListener("click", () => {
          errorMessage.style.display = "none";
          manualCoordinatesContainer.style.display = "none";
          triggerGeocoding();
        });
      }
    } finally {
      addressInput.disabled = false;
      stateInput.disabled = false;
      currentGeocodeAbort = null;
    }
  };

  // Handle manual coordinate entry
  const handleManualCoordinates = async () => {
    const coordinatesStr = coordinatesInput.value.trim();
    if (!coordinatesStr) {
      manualCoordinatesError.textContent = "Please enter coordinates";
      manualCoordinatesError.style.display = "block";
      return;
    }

    // Parse coordinates (format: "lat, lng" or "lat,lng")
    const parts = coordinatesStr.split(',').map(p => p.trim());
    if (parts.length !== 2) {
      manualCoordinatesError.textContent = "Invalid format. Please use: latitude, longitude (e.g., -37.8136, 144.9631)";
      manualCoordinatesError.style.display = "block";
      return;
    }

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lng)) {
      manualCoordinatesError.textContent = "Invalid coordinates. Please enter valid numbers.";
      manualCoordinatesError.style.display = "block";
      return;
    }

    try {
      const coordinates = createCoordinate(lat, lng);
      geocodedCoordinates = { lat, lng };

      // Infer country code
      inferredCountry = await inferCountryCodeFromCoordinates(coordinates);
      if (!inferredCountry || inferredCountry === "Unknown") {
        manualCoordinatesError.textContent = "Could not determine country from coordinates. Please verify coordinates are correct or try a different location.";
        manualCoordinatesError.style.display = "block";
        return;
      }
      
      // Check for duplicate name now that we have country
      checkDuplicateName();

      // Generate allocation suggestions
      const prospectName = prospectNameInput.value.trim() || "New Prospect";
      allocationSuggestions = await generateProspectAllocationSuggestions(
        prospectName,
        coordinates,
        eventAmbassadors,
        eventDetails,
        regionalAmbassadors
      );

      // Hide manual entry, show suggestions
      manualCoordinatesContainer.style.display = "none";
      manualCoordinatesError.style.display = "none";
      errorMessage.style.display = "none";
      coordinatesEnteredManually = true;
      displayAllocationSuggestions();
    } catch (error) {
      manualCoordinatesError.textContent = error instanceof Error ? error.message : "Invalid coordinates";
      manualCoordinatesError.style.display = "block";
      geocodedCoordinates = null;
      inferredCountry = null;
    }
  };

  useManualCoordinatesButton.addEventListener("click", handleManualCoordinates);
  coordinatesInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleManualCoordinates();
    }
  });

  // Display allocation suggestions
  const displayAllocationSuggestions = () => {
    if (allocationSuggestions.length === 0) {
      suggestionsContainer.innerHTML = '<p style="color: #666;">No allocation suggestions available.</p>';
      suggestionsContainer.style.display = "block";
      return;
    }

    suggestionsContainer.innerHTML = "";
    const suggestionsLabel = document.createElement("p");
    suggestionsLabel.textContent = "Suggested Event Ambassadors:";
    suggestionsLabel.style.fontWeight = "bold";
    suggestionsLabel.style.marginBottom = "0.5em";
    suggestionsContainer.appendChild(suggestionsLabel);

    const topSuggestions = allocationSuggestions.slice(0, 5);
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.flexDirection = "column";
    buttonsContainer.style.gap = "0.5em";
    buttonsContainer.setAttribute("role", "group");
    buttonsContainer.setAttribute("aria-label", "Suggested Event Ambassadors");

    topSuggestions.forEach((suggestion, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "suggestion-button";
      
      const buttonText = document.createElement("div");
      buttonText.style.textAlign = "left";
      
      const nameSpan = document.createElement("span");
      nameSpan.style.fontWeight = "bold";
      nameSpan.textContent = suggestion.toAmbassador;
      buttonText.appendChild(nameSpan);

      const contextDiv = document.createElement("div");
      contextDiv.style.fontSize = "0.9em";
      contextDiv.style.color = "#555";
      contextDiv.style.marginTop = "0.25em";
      contextDiv.style.display = "flex";
      contextDiv.style.flexDirection = "column";
      contextDiv.style.gap = "0.25em";

      const liveCount = suggestion.liveEventsCount ?? 0;
      const prospectCount = suggestion.prospectEventsCount ?? 0;
      const totalCount = suggestion.allocationCount ?? (liveCount + prospectCount);

      const allocationInfo = document.createElement("div");
      allocationInfo.textContent = `${liveCount} live, ${prospectCount} prospect, ${totalCount} total`;
      contextDiv.appendChild(allocationInfo);

      if (suggestion.neighboringEvents && suggestion.neighboringEvents.length > 0) {
        const nearestEvent = suggestion.neighboringEvents[0];
        const distanceInfo = document.createElement("div");
        distanceInfo.textContent = `${nearestEvent.distanceKm.toFixed(1)} km to ${nearestEvent.name}`;
        contextDiv.appendChild(distanceInfo);
      }

      if (suggestion.reasons && suggestion.reasons.length > 0) {
        const reasonsDiv = document.createElement("div");
        reasonsDiv.textContent = suggestion.reasons.join(", ");
        contextDiv.appendChild(reasonsDiv);
      }

      if (suggestion.warnings && suggestion.warnings.length > 0) {
        const warningsDiv = document.createElement("div");
        warningsDiv.style.color = "#d32f2f";
        warningsDiv.style.fontWeight = "bold";
        warningsDiv.textContent = `⚠ ${suggestion.warnings.join(", ")}`;
        contextDiv.appendChild(warningsDiv);
      }

      buttonText.appendChild(contextDiv);
      button.appendChild(buttonText);
      button.style.padding = "0.75em 1em";
      button.style.textAlign = "left";
      button.style.border = suggestion.warnings && suggestion.warnings.length > 0 ? "2px solid #ff9800" : "1px solid #333";
      button.style.borderRadius = "4px";
      button.style.backgroundColor = index === 0 ? "#e3f2fd" : "white";
      button.style.cursor = "pointer";
      button.setAttribute("tabindex", index === 0 ? "0" : "-1");

      button.addEventListener("click", () => {
        handleEASelection(suggestion.toAmbassador);
      });

      // Keyboard support: Enter and Space activate button
      button.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleEASelection(suggestion.toAmbassador);
        }
      });

      buttonsContainer.appendChild(button);
    });

    suggestionsContainer.appendChild(buttonsContainer);

    // Add "Other" option
    const otherContainer = document.createElement("div");
    otherContainer.style.marginTop = "1em";
    const otherLabel = document.createElement("label");
    otherLabel.textContent = "Other:";
    otherLabel.style.display = "block";
    otherLabel.style.marginBottom = "0.5em";
    otherContainer.appendChild(otherLabel);

    const dropdown = document.createElement("select");
    dropdown.id = "otherEASelect";
    dropdown.style.width = "100%";
    dropdown.style.padding = "0.5em";
    dropdown.setAttribute("tabindex", topSuggestions.length > 0 ? "-1" : "0");

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Select an Event Ambassador";
    dropdown.appendChild(emptyOption);

    Array.from(eventAmbassadors.keys()).forEach(eaName => {
      const option = document.createElement("option");
      option.value = eaName;
      option.textContent = eaName;
      dropdown.appendChild(option);
    });

    dropdown.addEventListener("change", () => {
      if (dropdown.value) {
        handleEASelection(dropdown.value);
      }
    });

    otherContainer.appendChild(dropdown);
    suggestionsContainer.appendChild(otherContainer);
    suggestionsContainer.style.display = "block";
  };

  // Handle EA selection and prospect creation
  const handleEASelection = (eaName: string) => {
    if (!prospectNameInput.value.trim()) {
      errorMessage.textContent = "Please enter a prospect name";
      errorMessage.style.display = "block";
      return;
    }

    if (!stateInput.value.trim()) {
      errorMessage.textContent = "Please enter a state/region";
      errorMessage.style.display = "block";
      return;
    }

    if (!geocodedCoordinates) {
      errorMessage.textContent = "Please geocode an address or enter coordinates manually";
      errorMessage.style.display = "block";
      return;
    }

    if (!inferredCountry) {
      errorMessage.textContent = "Country could not be inferred. Please try a different address.";
      errorMessage.style.display = "block";
      return;
    }

    try {
      const prospectData = {
        prospectEvent: prospectNameInput.value.trim(),
        address: addressInput.value.trim(),
        state: stateInput.value.trim(),
        coordinates: createCoordinate(geocodedCoordinates.lat, geocodedCoordinates.lng),
        country: inferredCountry,
        eventAmbassador: eaName,
        prospectEDs: prospectEDsInput.value.trim() || undefined,
        dateMadeContact: dateMadeContactInput.value ? new Date(dateMadeContactInput.value) : null,
        courseFound: courseFoundCheckbox.checked,
        landownerPermission: landownerPermissionCheckbox.checked,
        fundingConfirmed: fundingConfirmedCheckbox.checked,
        geocodingStatus: coordinatesEnteredManually ? "manual" as const : "success" as const,
      };

      const prospect = createProspectFromAddress(
        prospectData,
        eventAmbassadors,
        regionalAmbassadors
      );

      // Persist prospect
      const existing = loadProspectiveEvents();
      saveProspectiveEvents([...existing, prospect]);

      // Log prospect creation
      if (log) {
        const timestamp = Date.now();
        const logEntry: LogEntry = {
          timestamp,
          type: "Prospect Created",
          event: `Prospect "${prospect.prospectEvent}" (${prospect.country}, ${prospect.state}) created and assigned to "${eaName}"`,
          oldValue: "",
          newValue: eaName,
        };
        log.unshift(logEntry);
      }

      // Close dialog and call success callback
      dialog.style.display = "none";
      cleanup();
      onSuccess();
    } catch (error) {
      errorMessage.textContent = error instanceof Error ? error.message : "Failed to create prospect";
      errorMessage.style.display = "block";
    }
  };

  // Trigger geocoding with debouncing
  const triggerGeocoding = () => {
    const address = addressInput.value.trim();
    const state = stateInput.value.trim();

    if (!address || !state) {
      return;
    }

    if (geocodeTimeout) {
      clearTimeout(geocodeTimeout);
    }

    geocodeTimeout = setTimeout(() => {
      performGeocoding(address, state);
    }, 500);
  };

  // Re-geocode if address changes after successful geocoding
  addressInput.addEventListener("input", () => {
    const currentAddress = addressInput.value.trim();
    if (lastGeocodedAddress && currentAddress !== lastGeocodedAddress) {
      triggerGeocoding();
    }
  });

  addressInput.addEventListener("blur", () => {
    triggerGeocoding();
  });

  stateInput.addEventListener("blur", () => {
    triggerGeocoding();
  });

  // Cleanup function
  let cleanup = () => {
    if (geocodeTimeout) {
      clearTimeout(geocodeTimeout);
      geocodeTimeout = null;
    }
    if (currentGeocodeAbort) {
      currentGeocodeAbort.abort();
      currentGeocodeAbort = null;
    }
    cancelButton.removeEventListener("click", handleCancel);
    document.removeEventListener("keydown", handleKeyDown);
  };

  // Cancel handler
  const handleCancel = () => {
    dialog.style.display = "none";
    cleanup();
    onCancel();
  };

  // Check for duplicate prospect name
  const checkDuplicateName = () => {
    const prospectName = prospectNameInput.value.trim();
    const state = stateInput.value.trim();
    
    if (!prospectName || !state) {
      duplicateWarning.style.display = "none";
      return;
    }
    
    // Only check for duplicates if we have a valid country (either from geocoding or manual entry)
    if (!inferredCountry || inferredCountry === "Unknown") {
      duplicateWarning.style.display = "none";
      return;
    }

    const existing = loadProspectiveEvents();
    const existingList = new ProspectiveEventList(existing);
    
    // Check for duplicates based on prospectEvent, country, and state (same logic as import)
    const countryToCheck = inferredCountry;
    const duplicate = existingList.getAll().find(event => 
      event.prospectEvent.toLowerCase() === prospectName.toLowerCase() &&
      event.country.toUpperCase() === countryToCheck.toUpperCase() &&
      event.state.toUpperCase() === state.toUpperCase()
    );

    if (duplicate) {
      duplicateWarning.innerHTML = `
        ⚠️ <strong>Warning:</strong> A prospect named "${prospectName}" already exists in ${countryToCheck}, ${state}.
        You can still create this prospect, but it may be a duplicate.
      `;
      duplicateWarning.style.display = "block";
    } else {
      duplicateWarning.style.display = "none";
    }
  };

  // Check for duplicates when name, state, or country changes
  prospectNameInput.addEventListener("input", () => {
    checkDuplicateName();
  });
  
  stateInput.addEventListener("input", () => {
    checkDuplicateName();
  });

  // Keyboard handler for dialog navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
    }
    // Tab navigation is handled by browser by default
    // Enter key: if pressed on an input field and suggestions are visible, focus first suggestion button
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
      const suggestionsVisible = suggestionsContainer.style.display !== "none";
      if (suggestionsVisible && allocationSuggestions.length > 0) {
        event.preventDefault();
        const firstButton = content.querySelector('button.suggestion-button') as HTMLButtonElement;
        if (firstButton) {
          firstButton.focus();
          firstButton.click();
        }
      }
    }
  };

  // Show dialog with accessibility attributes
  dialog.style.display = "block";
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-labelledby", "reallocationDialogTitle");

  // Add event listeners
  cancelButton.addEventListener("click", handleCancel);
  document.addEventListener("keydown", handleKeyDown);

  // Focus management: focus first input when dialog opens
  prospectNameInput.focus();
  
  // Store original focus element to restore on close
  const originalActiveElement = document.activeElement as HTMLElement;
  
  // Enhanced cleanup to restore focus
  const originalCleanup = cleanup;
  cleanup = () => {
    originalCleanup();
    // Restore focus to original element if it still exists
    if (originalActiveElement && document.contains(originalActiveElement)) {
      originalActiveElement.focus();
    }
  };
}
