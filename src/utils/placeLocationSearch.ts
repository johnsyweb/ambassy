import { createCoordinate } from "@models/Coordinate";
import { inferCountryCodeFromCoordinates } from "@models/country";
import {
  geocodeAddress,
  PlaceGeocodingUnavailableError,
  PlaceSearchResult,
  searchPlaces,
} from "@utils/geocoding";
import {
  buildPlaceSearchQuery,
  inferExpectedCountryCodeFromStateRegion,
} from "@utils/prospectPlaceSearch";
import {
  getAddProspectLocationStatusClassName,
  renderAddProspectLocationStatusMessage,
} from "@utils/addProspectLocationStatus";
import { renderAddProspectPlaceListboxHtml } from "@utils/renderAddProspectPlaceListboxHtml";

export type PlaceLocationResolutionSource = "photon" | "manual" | "coordinate-string";

export interface PlaceLocationResolution {
  latitude: number;
  longitude: number;
  addressLabel: string;
  country: string;
  state: string;
  source: PlaceLocationResolutionSource;
}

export type PlaceLocationCommitMode = "immediate" | "preview";

export interface PlaceLocationSearchBindings {
  stateInput: HTMLInputElement;
  addressInput: HTMLInputElement;
  addressField: HTMLElement;
  placesListbox: HTMLElement;
  locationStatus: HTMLElement;
  errorMessage: HTMLElement;
  manualCoordinatesContainer: HTMLElement;
  coordinatesInput: HTMLInputElement;
  manualCoordinatesError: HTMLElement;
  useManualCoordinatesButton: HTMLButtonElement;
}

export interface BindPlaceLocationSearchOptions {
  bindings: PlaceLocationSearchBindings;
  commitMode: PlaceLocationCommitMode;
  includeManualCoordinates: boolean;
  debounceMs?: number;
  autoSearchOnBlur?: boolean;
  previewConfirmLabel?: string;
  onResolved: (resolution: PlaceLocationResolution) => void | Promise<void>;
  onBeforeSearch?: () => void;
  onAfterSearch?: () => void;
}

export interface PlaceLocationSearchController {
  getPreview(): PlaceLocationResolution | null;
  clearPreview(): void;
  triggerSearch(): void;
  destroy(): void;
}

const COORDINATE_STRING_PATTERN = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;

export function bindPlaceLocationSearch(
  options: BindPlaceLocationSearchOptions,
): PlaceLocationSearchController {
  const {
    bindings,
    commitMode,
    includeManualCoordinates,
    debounceMs = 500,
    autoSearchOnBlur = true,
    previewConfirmLabel = "click Resolve to confirm",
    onResolved,
    onBeforeSearch,
    onAfterSearch,
  } = options;

  const {
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
  } = bindings;

  let geocodeTimeout: ReturnType<typeof setTimeout> | null = null;
  let activePlaceSuggestions: PlaceSearchResult[] = [];
  let preview: PlaceLocationResolution | null = null;
  let searchGeneration = 0;

  const hidePlacesListbox = () => {
    placesListbox.hidden = true;
    placesListbox.innerHTML = "";
    activePlaceSuggestions = [];
    addressInput.setAttribute("aria-expanded", "false");
    addressField.classList.remove("add-prospect-address-field--places-open");
  };

  const showPlacesListbox = (places: PlaceSearchResult[]) => {
    activePlaceSuggestions = places;
    placesListbox.innerHTML = renderAddProspectPlaceListboxHtml(places);
    placesListbox.hidden = false;
    addressInput.setAttribute("aria-expanded", "true");
    addressField.classList.add("add-prospect-address-field--places-open");
    locationStatus.className =
      getAddProspectLocationStatusClassName("choose-place");
    locationStatus.textContent = renderAddProspectLocationStatusMessage(
      "choose-place",
      { placeCount: places.length },
    );
    locationStatus.style.display = "block";
    locationStatus.removeAttribute("aria-busy");
  };

  const setLocationStatusLoading = () => {
    locationStatus.className = getAddProspectLocationStatusClassName("loading");
    locationStatus.textContent =
      renderAddProspectLocationStatusMessage("loading");
    locationStatus.style.display = "block";
    locationStatus.setAttribute("aria-busy", "true");
  };

  const clearLocationStatus = () => {
    locationStatus.style.display = "none";
    locationStatus.textContent = "";
    locationStatus.removeAttribute("aria-busy");
  };

  const formatPreviewCoordinate = (coordinate: {
    latitude: number;
    longitude: number;
  }) => `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`;

  const setLocationStatusPreview = (
    latitude: number,
    longitude: number,
    country: string,
  ) => {
    const coordinate = createCoordinate(latitude, longitude);
    locationStatus.className = getAddProspectLocationStatusClassName("success");
    locationStatus.textContent = `Place selected (${formatPreviewCoordinate(coordinate)}, ${country}) — ${previewConfirmLabel}.`;
    locationStatus.style.display = "block";
    locationStatus.removeAttribute("aria-busy");
  };

  const buildResolution = async (
    latitude: number,
    longitude: number,
    addressLabel: string,
    source: PlaceLocationResolutionSource,
  ): Promise<PlaceLocationResolution> => {
    const coordinates = createCoordinate(latitude, longitude);
    const country = await inferCountryCodeFromCoordinates(coordinates);

    if (!country || country === "Unknown") {
      throw new Error(
        "Could not determine country from coordinates. Please verify the address or enter coordinates manually.",
      );
    }

    return {
      latitude,
      longitude,
      addressLabel,
      country,
      state: stateInput.value.trim(),
      source,
    };
  };

  const commitResolution = async (resolution: PlaceLocationResolution) => {
    if (commitMode === "preview") {
      preview = resolution;
      addressInput.value = resolution.addressLabel;
      setLocationStatusPreview(
        resolution.latitude,
        resolution.longitude,
        resolution.country,
      );
      hidePlacesListbox();
      errorMessage.style.display = "none";
      if (includeManualCoordinates) {
        manualCoordinatesContainer.style.display = "none";
      }
      return;
    }

    await onResolved(resolution);
  };

  const showManualCoordinateFallback = (message: string) => {
    clearLocationStatus();
    hidePlacesListbox();
    errorMessage.innerHTML = `
      ${message}
      <br>
      <button type="button" class="place-location-retry-button" style="margin-top: 0.5em; padding: 0.25em 0.5em; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Retry search
      </button>
    `;
    errorMessage.style.display = "block";

    if (includeManualCoordinates) {
      manualCoordinatesContainer.style.display = "block";
    }

    const retryButton = errorMessage.querySelector(
      ".place-location-retry-button",
    ) as HTMLButtonElement | null;
    retryButton?.addEventListener("click", () => {
      errorMessage.style.display = "none";
      if (includeManualCoordinates) {
        manualCoordinatesContainer.style.display = "none";
      }
      triggerSearch();
    });
  };

  const applySelectedPlace = async (place: PlaceSearchResult) => {
    addressInput.value = place.label;
    setLocationStatusLoading();
    hidePlacesListbox();

    try {
      const resolution = await buildResolution(
        place.latitude,
        place.longitude,
        place.label,
        "photon",
      );
      await commitResolution(resolution);
    } catch (error) {
      clearLocationStatus();
      showManualCoordinateFallback(
        error instanceof Error ? error.message : "Could not use selected place",
      );
    }
  };

  const performSearch = async (address: string, state: string) => {
    if (!address.trim() || !state.trim()) {
      return;
    }

    const generation = ++searchGeneration;
    onBeforeSearch?.();
    setLocationStatusLoading();
    errorMessage.style.display = "none";
    hidePlacesListbox();
    if (includeManualCoordinates) {
      manualCoordinatesContainer.style.display = "none";
    }
    addressInput.disabled = true;
    stateInput.disabled = true;
    preview = null;

    try {
      if (COORDINATE_STRING_PATTERN.test(address.trim())) {
        const { lat, lng } = await geocodeAddress(address);
        const resolution = await buildResolution(
          lat,
          lng,
          address,
          "coordinate-string",
        );
        if (generation !== searchGeneration) {
          return;
        }
        await commitResolution(resolution);
        return;
      }

      const places = await searchPlaces(buildPlaceSearchQuery(address, state));
      if (generation !== searchGeneration) {
        return;
      }

      if (places.length === 0) {
        showManualCoordinateFallback(
          "No matching places found. Try refining the address or enter coordinates manually.",
        );
        return;
      }

      if (places.length === 1) {
        const place = places[0];
        const coordinates = createCoordinate(place.latitude, place.longitude);
        const inferred = await inferCountryCodeFromCoordinates(coordinates);
        const expectedCountry = inferExpectedCountryCodeFromStateRegion(state);

        if (
          expectedCountry &&
          inferred &&
          inferred !== "Unknown" &&
          inferred !== expectedCountry
        ) {
          showPlacesListbox(places);
          return;
        }

        const resolution = await buildResolution(
          place.latitude,
          place.longitude,
          place.label,
          "photon",
        );
        await commitResolution(resolution);
        return;
      }

      showPlacesListbox(places);
    } catch (error) {
      if (generation !== searchGeneration) {
        return;
      }

      if (error instanceof PlaceGeocodingUnavailableError) {
        showManualCoordinateFallback(error.message);
        return;
      }

      showManualCoordinateFallback(
        error instanceof Error ? error.message : "Place search failed",
      );
    } finally {
      if (generation === searchGeneration) {
        addressInput.disabled = false;
        stateInput.disabled = false;
        onAfterSearch?.();
      }
    }
  };

  const triggerSearch = () => {
    const address = addressInput.value.trim();
    const state = stateInput.value.trim();

    if (!address || !state) {
      return;
    }

    if (geocodeTimeout) {
      clearTimeout(geocodeTimeout);
    }

    setLocationStatusLoading();
    geocodeTimeout = setTimeout(() => {
      void performSearch(address, state);
    }, debounceMs);
  };

  const handleManualCoordinates = async () => {
    const coordinatesStr = coordinatesInput.value.trim();
    if (!coordinatesStr) {
      manualCoordinatesError.textContent = "Please enter coordinates";
      manualCoordinatesError.style.display = "block";
      return;
    }

    const parts = coordinatesStr.split(",").map((part) => part.trim());
    if (parts.length !== 2) {
      manualCoordinatesError.textContent =
        "Invalid format. Please use: latitude, longitude (e.g., -37.8136, 144.9631)";
      manualCoordinatesError.style.display = "block";
      return;
    }

    const lat = Number.parseFloat(parts[0]);
    const lng = Number.parseFloat(parts[1]);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      manualCoordinatesError.textContent =
        "Invalid coordinates. Please enter valid numbers.";
      manualCoordinatesError.style.display = "block";
      return;
    }

    try {
      const resolution = await buildResolution(
        lat,
        lng,
        addressInput.value.trim() || coordinatesStr,
        "manual",
      );
      manualCoordinatesContainer.style.display = "none";
      manualCoordinatesError.style.display = "none";
      errorMessage.style.display = "none";
      await commitResolution(resolution);
    } catch (error) {
      manualCoordinatesError.textContent =
        error instanceof Error ? error.message : "Invalid coordinates";
      manualCoordinatesError.style.display = "block";
    }
  };

  const onPlacesListboxClick = (event: Event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const button = event.target.closest(
      ".add-prospect-place-option",
    ) as HTMLButtonElement | null;
    if (!button) {
      return;
    }

    const placeIndex = Number.parseInt(button.dataset.placeIndex ?? "", 10);
    const place = activePlaceSuggestions[placeIndex];
    if (place) {
      void applySelectedPlace(place);
    }
  };

  const onManualCoordinatesKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleManualCoordinates();
    }
  };

  const onManualCoordinatesClick = () => {
    void handleManualCoordinates();
  };

  placesListbox.addEventListener("click", onPlacesListboxClick);
  useManualCoordinatesButton.addEventListener("click", onManualCoordinatesClick);
  coordinatesInput.addEventListener("keydown", onManualCoordinatesKeyDown);
  if (autoSearchOnBlur) {
    addressInput.addEventListener("blur", triggerSearch);
    stateInput.addEventListener("blur", triggerSearch);
  }

  if (!includeManualCoordinates) {
    manualCoordinatesContainer.style.display = "none";
  }

  return {
    getPreview: () => preview,
    clearPreview: () => {
      preview = null;
      clearLocationStatus();
    },
    triggerSearch,
    destroy: () => {
      if (geocodeTimeout) {
        clearTimeout(geocodeTimeout);
        geocodeTimeout = null;
      }
      searchGeneration += 1;
      placesListbox.removeEventListener("click", onPlacesListboxClick);
      useManualCoordinatesButton.removeEventListener(
        "click",
        onManualCoordinatesClick,
      );
      coordinatesInput.removeEventListener("keydown", onManualCoordinatesKeyDown);
      if (autoSearchOnBlur) {
        addressInput.removeEventListener("blur", triggerSearch);
        stateInput.removeEventListener("blur", triggerSearch);
      }
    },
  };
}
