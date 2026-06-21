import type { PlaceLocationSearchBindings } from "./placeLocationSearch";

export interface PlaceLocationSearchUiOptions {
  stateInputId: string;
  addressInputId: string;
  placesListboxId: string;
  locationStatusId: string;
  errorMessageId: string;
  manualCoordinatesId: string;
  statePlaceholder?: string;
  addressPlaceholder?: string;
  includeManualCoordinates: boolean;
}

export function appendPlaceLocationSearchUi(
  container: HTMLElement,
  options: PlaceLocationSearchUiOptions,
): PlaceLocationSearchBindings {
  const stateLabel = document.createElement("label");
  stateLabel.htmlFor = options.stateInputId;
  stateLabel.textContent = "State/Region: *";
  stateLabel.style.display = "block";
  stateLabel.style.marginBottom = "0.25em";
  stateLabel.style.fontWeight = "bold";
  container.appendChild(stateLabel);

  const stateInput = document.createElement("input");
  stateInput.id = options.stateInputId;
  stateInput.type = "text";
  stateInput.placeholder = options.statePlaceholder ?? "e.g., VIC, NSW, NZ";
  stateInput.style.width = "100%";
  stateInput.style.padding = "0.5em";
  stateInput.style.marginBottom = "1em";
  stateInput.style.border = "1px solid #ccc";
  stateInput.style.borderRadius = "4px";
  stateInput.setAttribute("autocomplete", "off");
  container.appendChild(stateInput);

  const addressLabel = document.createElement("label");
  addressLabel.htmlFor = options.addressInputId;
  addressLabel.textContent = "Address: *";
  addressLabel.style.display = "block";
  addressLabel.style.marginBottom = "0.25em";
  addressLabel.style.fontWeight = "bold";

  const addressField = document.createElement("div");
  addressField.className = "add-prospect-address-field";
  addressField.appendChild(addressLabel);

  const addressInput = document.createElement("input");
  addressInput.id = options.addressInputId;
  addressInput.type = "text";
  addressInput.placeholder =
    options.addressPlaceholder ??
    "e.g., 123 Main St, Melbourne VIC 3000, Australia";
  addressInput.style.width = "100%";
  addressInput.style.padding = "0.5em";
  addressInput.style.border = "1px solid #ccc";
  addressInput.style.borderRadius = "4px";
  addressInput.setAttribute("role", "combobox");
  addressInput.setAttribute("aria-expanded", "false");
  addressInput.setAttribute("aria-controls", options.placesListboxId);
  addressInput.setAttribute("autocomplete", "off");
  addressInput.setAttribute("data-1p-ignore", "true");
  addressInput.setAttribute("data-lpignore", "true");
  addressInput.setAttribute("spellcheck", "false");
  addressField.appendChild(addressInput);

  const placesListbox = document.createElement("div");
  placesListbox.id = options.placesListboxId;
  placesListbox.className = "territory-map-search-listbox";
  placesListbox.hidden = true;
  placesListbox.setAttribute("role", "listbox");
  placesListbox.setAttribute("aria-label", "Places");
  addressField.appendChild(placesListbox);

  const locationStatus = document.createElement("div");
  locationStatus.id = options.locationStatusId;
  locationStatus.className =
    "add-prospect-location-status territory-map-search-status";
  locationStatus.style.display = "none";
  locationStatus.setAttribute("role", "status");
  locationStatus.setAttribute("aria-live", "polite");
  addressField.appendChild(locationStatus);

  container.appendChild(addressField);

  const errorMessage = document.createElement("div");
  errorMessage.id = options.errorMessageId;
  errorMessage.style.display = "none";
  errorMessage.style.color = "#d32f2f";
  errorMessage.style.marginTop = "0.5em";
  errorMessage.setAttribute("role", "alert");
  container.appendChild(errorMessage);

  const manualCoordinatesContainer = document.createElement("div");
  manualCoordinatesContainer.id = options.manualCoordinatesId;
  manualCoordinatesContainer.style.display = "none";
  manualCoordinatesContainer.style.marginTop = "1em";
  manualCoordinatesContainer.style.padding = "1em";
  manualCoordinatesContainer.style.border = "1px solid #ccc";
  manualCoordinatesContainer.style.borderRadius = "4px";
  manualCoordinatesContainer.style.backgroundColor = "#f9f9f9";

  const manualCoordinatesLabel = document.createElement("p");
  manualCoordinatesLabel.textContent = "Enter coordinates manually:";
  manualCoordinatesLabel.style.fontWeight = "bold";
  manualCoordinatesLabel.style.marginBottom = "0.5em";
  manualCoordinatesContainer.appendChild(manualCoordinatesLabel);

  const coordinatesInputLabel = document.createElement("label");
  coordinatesInputLabel.textContent = "Latitude, longitude:";
  coordinatesInputLabel.style.display = "block";
  coordinatesInputLabel.style.marginBottom = "0.25em";
  manualCoordinatesContainer.appendChild(coordinatesInputLabel);

  const coordinatesInput = document.createElement("input");
  coordinatesInput.type = "text";
  coordinatesInput.placeholder = "e.g., -37.8136, 144.9631";
  coordinatesInput.style.width = "100%";
  coordinatesInput.style.padding = "0.5em";
  coordinatesInput.style.border = "1px solid #ccc";
  coordinatesInput.style.borderRadius = "4px";
  coordinatesInput.setAttribute("autocomplete", "off");
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
  useManualCoordinatesButton.textContent = "Use coordinates";
  useManualCoordinatesButton.style.padding = "0.5em 1em";
  useManualCoordinatesButton.style.backgroundColor = "#007bff";
  useManualCoordinatesButton.style.color = "white";
  useManualCoordinatesButton.style.border = "none";
  useManualCoordinatesButton.style.borderRadius = "4px";
  useManualCoordinatesButton.style.cursor = "pointer";
  manualCoordinatesContainer.appendChild(useManualCoordinatesButton);

  if (options.includeManualCoordinates) {
    container.appendChild(manualCoordinatesContainer);
  }

  return {
    stateInput,
    addressInput,
    addressField,
    placesListbox,
    locationStatus,
    errorMessage,
    manualCoordinatesContainer,
    coordinatesInput,
    manualCoordinatesError,
    useManualCoordinatesButton,
  };
}
