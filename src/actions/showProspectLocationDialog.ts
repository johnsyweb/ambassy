import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { createCoordinate, formatCoordinate } from "@models/Coordinate";
import { inferCountryCodeFromCoordinates } from "@models/country";
import { saveProspectiveEvents } from "./persistProspectiveEvents";
import { appendPlaceLocationSearchUi } from "@utils/appendPlaceLocationSearchUi";
import {
  bindPlaceLocationSearch,
  PlaceLocationResolution,
} from "@utils/placeLocationSearch";

export function showProspectLocationDialog(
  prospect: ProspectiveEvent,
  prospects: ProspectiveEventList,
  onUpdated: () => void,
): void {
  const dialog = document.createElement("div");
  dialog.style.position = "fixed";
  dialog.style.top = "0";
  dialog.style.left = "0";
  dialog.style.width = "100%";
  dialog.style.height = "100%";
  dialog.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  dialog.style.display = "flex";
  dialog.style.alignItems = "center";
  dialog.style.justifyContent = "center";
  dialog.style.zIndex = "1000";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");

  const dialogContent = document.createElement("div");
  dialogContent.style.backgroundColor = "white";
  dialogContent.style.padding = "2em";
  dialogContent.style.borderRadius = "8px";
  dialogContent.style.maxWidth = "500px";
  dialogContent.style.width = "90%";
  dialogContent.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";

  const title = document.createElement("h2");
  title.textContent = `Reset Location for ${prospect.prospectEvent}`;
  title.style.marginTop = "0";
  dialogContent.appendChild(title);

  const currentLocation = document.createElement("p");
  currentLocation.textContent = prospect.coordinates
    ? `Current coordinates: ${formatCoordinate(prospect.coordinates)}`
    : "No coordinates set";
  currentLocation.style.fontSize = "0.9em";
  currentLocation.style.color = "#666";
  dialogContent.appendChild(currentLocation);

  const bindings = appendPlaceLocationSearchUi(dialogContent, {
    stateInputId: "resetProspectStateInput",
    addressInputId: "resetProspectAddressInput",
    placesListboxId: "resetProspectPlacesListbox",
    locationStatusId: "resetProspectLocationStatus",
    errorMessageId: "resetProspectLocationError",
    manualCoordinatesId: "resetProspectManualCoordinates",
    includeManualCoordinates: true,
  });

  bindings.stateInput.value = prospect.state;

  const geolocationContainer = document.createElement("div");
  geolocationContainer.style.marginTop = "1em";
  geolocationContainer.style.marginBottom = "1em";

  const geolocationButton = document.createElement("button");
  geolocationButton.type = "button";
  geolocationButton.textContent = "📍 Use current location";
  geolocationButton.style.padding = "0.5em 1em";
  geolocationButton.style.backgroundColor = "#28a745";
  geolocationButton.style.color = "white";
  geolocationButton.style.border = "none";
  geolocationButton.style.borderRadius = "4px";
  geolocationButton.style.cursor = "pointer";
  geolocationButton.title = "Use browser geolocation to set coordinates";
  geolocationContainer.appendChild(geolocationButton);
  dialogContent.appendChild(geolocationContainer);

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "1em";
  buttonContainer.style.justifyContent = "flex-end";
  buttonContainer.style.marginTop = "1em";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";
  cancelButton.style.padding = "0.5em 1em";
  buttonContainer.appendChild(cancelButton);
  dialogContent.appendChild(buttonContainer);

  dialog.appendChild(dialogContent);
  document.body.appendChild(dialog);

  const closeDialog = () => {
    placeSearch.destroy();
    document.body.removeChild(dialog);
  };

  const persistLocation = (
    resolution: PlaceLocationResolution,
    geocodingStatus: "success" | "manual",
  ) => {
    prospects.update({
      ...prospect,
      coordinates: createCoordinate(resolution.latitude, resolution.longitude),
      state: resolution.state,
      country: resolution.country,
      geocodingStatus,
    });
    saveProspectiveEvents(prospects.getAll());
    onUpdated();
    closeDialog();
  };

  const placeSearch = bindPlaceLocationSearch({
    bindings,
    commitMode: "immediate",
    includeManualCoordinates: true,
    onResolved: async (resolution) => {
      const geocodingStatus =
        resolution.source === "photon" || resolution.source === "coordinate-string"
          ? "success"
          : "manual";
      persistLocation(resolution, geocodingStatus);
    },
  });

  cancelButton.addEventListener("click", closeDialog);

  geolocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      bindings.errorMessage.textContent =
        "Geolocation is not supported by this browser.";
      bindings.errorMessage.style.display = "block";
      return;
    }

    geolocationButton.disabled = true;
    geolocationButton.textContent = "Getting location…";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const coordinates = createCoordinate(
            position.coords.latitude,
            position.coords.longitude,
          );
          const country = await inferCountryCodeFromCoordinates(coordinates);
          if (!country || country === "Unknown") {
            throw new Error(
              "Could not determine country from current location.",
            );
          }

          persistLocation(
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              addressLabel:
                bindings.addressInput.value.trim() || "Current location",
              country,
              state: bindings.stateInput.value.trim(),
              source: "manual",
            },
            "manual",
          );
        } catch (error) {
          bindings.errorMessage.textContent =
            error instanceof Error ? error.message : "Geolocation failed";
          bindings.errorMessage.style.display = "block";
          geolocationButton.disabled = false;
          geolocationButton.textContent = "📍 Use current location";
        }
      },
      (error) => {
        let errorMessage = "Unknown geolocation error";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        bindings.errorMessage.textContent = errorMessage;
        bindings.errorMessage.style.display = "block";
        geolocationButton.disabled = false;
        geolocationButton.textContent = "📍 Use current location";
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  });

  bindings.stateInput.focus();
}
