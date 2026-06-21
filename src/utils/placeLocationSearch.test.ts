import {
  bindPlaceLocationSearch,
  PlaceLocationResolution,
} from "./placeLocationSearch";
import { searchPlaces } from "@utils/geocoding";
import { inferCountryCodeFromCoordinates } from "@models/country";

jest.mock("@utils/geocoding", () => {
  const actual = jest.requireActual<typeof import("@utils/geocoding")>(
    "@utils/geocoding",
  );
  return {
    ...actual,
    searchPlaces: jest.fn(),
  };
});

jest.mock("@models/country", () => ({
  inferCountryCodeFromCoordinates: jest.fn(),
}));

function createBindings() {
  const stateInput = document.createElement("input");
  const addressInput = document.createElement("input");
  const addressField = document.createElement("div");
  const placesListbox = document.createElement("div");
  const locationStatus = document.createElement("div");
  const errorMessage = document.createElement("div");
  const manualCoordinatesContainer = document.createElement("div");
  const coordinatesInput = document.createElement("input");
  const manualCoordinatesError = document.createElement("div");
  const useManualCoordinatesButton = document.createElement("button");

  addressField.appendChild(addressInput);
  document.body.appendChild(stateInput);
  document.body.appendChild(addressField);
  document.body.appendChild(errorMessage);
  document.body.appendChild(manualCoordinatesContainer);

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

describe("bindPlaceLocationSearch", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (inferCountryCodeFromCoordinates as jest.Mock).mockResolvedValue("AU");
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = "";
  });

  it("resolves immediately when a single place matches the state region", async () => {
    (searchPlaces as jest.Mock).mockResolvedValue([
      {
        label: "Melbourne, Victoria, Australia",
        latitude: -37.8136,
        longitude: 144.9631,
      },
    ]);

    const bindings = createBindings();
    bindings.stateInput.value = "VIC";
    bindings.addressInput.value = "Melbourne";

    const resolutions: PlaceLocationResolution[] = [];
    const controller = bindPlaceLocationSearch({
      bindings,
      commitMode: "immediate",
      includeManualCoordinates: true,
      onResolved: async (resolution) => {
        resolutions.push(resolution);
      },
    });

    controller.triggerSearch();
    await jest.runAllTimersAsync();
    await Promise.resolve();

    expect(resolutions).toHaveLength(1);
    expect(resolutions[0].country).toBe("AU");
    controller.destroy();
  });

  it("stores a preview without calling onResolved in preview mode", async () => {
    (searchPlaces as jest.Mock).mockResolvedValue([
      {
        label: "Melbourne, Victoria, Australia",
        latitude: -37.8136,
        longitude: 144.9631,
      },
    ]);

    const bindings = createBindings();
    bindings.stateInput.value = "VIC";
    bindings.addressInput.value = "Melbourne";

    const onResolved = jest.fn();
    const controller = bindPlaceLocationSearch({
      bindings,
      commitMode: "preview",
      includeManualCoordinates: false,
      onResolved,
    });

    controller.triggerSearch();
    await jest.runAllTimersAsync();
    await Promise.resolve();

    expect(onResolved).not.toHaveBeenCalled();
    expect(controller.getPreview()?.latitude).toBe(-37.8136);
    controller.destroy();
  });
});
