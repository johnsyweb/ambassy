import L from "leaflet";
import {
  getTemporaryPlacePinLayer,
  getTemporaryPlacePin,
  openTemporaryPlacePinActions,
  resetTemporaryPlacePinForTests,
  setTemporaryPlacePin,
  shouldClearPlacePinOnMapClick,
} from "./temporaryPlacePin";

describe("temporaryPlacePin", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="mapContainer"></div>';
    resetTemporaryPlacePinForTests();
  });

  it("adds a marker layer at the selected place coordinates", () => {
    const map = L.map("mapContainer").setView([-37.81, 144.96], 10);

    setTemporaryPlacePin(map, -37.5622, 143.8503);

    const layer = getTemporaryPlacePinLayer();
    expect(layer).not.toBeNull();
    expect(map.hasLayer(layer!)).toBe(true);
    expect(layer!.getLayers()).toHaveLength(1);
  });

  it("clears the previous pin when a new place is selected", () => {
    const map = L.map("mapContainer").setView([-37.81, 144.96], 10);

    setTemporaryPlacePin(map, -37.5622, 143.8503);
    const firstLayer = getTemporaryPlacePinLayer();

    setTemporaryPlacePin(map, -37.8136, 144.9631);

    expect(map.hasLayer(firstLayer!)).toBe(false);
    expect(getTemporaryPlacePinLayer()?.getLayers()).toHaveLength(1);
  });

  it("stores the place label for dialog pre-fill and search status", () => {
    const map = L.map("mapContainer").setView([-37.81, 144.96], 10);

    setTemporaryPlacePin(map, -37.5622, 143.8503, {
      label: "Ballarat, Victoria, Australia",
    });

    expect(getTemporaryPlacePin()).toEqual({
      label: "Ballarat, Victoria, Australia",
      latitude: -37.5622,
      longitude: 143.8503,
      coordinatesWereDragged: false,
    });
  });

  it("renders a high-contrast pin icon on the map", () => {
    const map = L.map("mapContainer").setView([-37.81, 144.96], 10);

    setTemporaryPlacePin(map, -37.5622, 143.8503, {
      label: "Ballarat, Victoria, Australia",
    });

    expect(
      document.querySelector(".temporary-place-pin-marker svg circle"),
    ).not.toBeNull();
  });

  it("opens a popup with add prospect action when the pin is clicked", () => {
    const map = L.map("mapContainer").setView([-37.81, 144.96], 10);

    setTemporaryPlacePin(map, -37.5622, 143.8503, {
      label: "Ballarat, Victoria, Australia",
    });

    const marker = getTemporaryPlacePinLayer()?.getLayers()[0] as L.Marker;
    marker.fire("click");

    expect(
      document.querySelector(".temporary-place-pin-add-prospect"),
    ).not.toBeNull();
    expect(document.querySelector(".temporary-place-pin-popup-label")?.textContent).toBe(
      "Ballarat, Victoria, Australia",
    );
  });

  it("calls onAddProspect when add action is chosen in the popup", () => {
    const map = L.map("mapContainer").setView([-37.81, 144.96], 10);
    const onAddProspect = jest.fn();

    setTemporaryPlacePin(map, -37.5622, 143.8503, {
      label: "Ballarat, Victoria, Australia",
      onAddProspect,
    });

    const marker = getTemporaryPlacePinLayer()?.getLayers()[0] as L.Marker;
    marker.fire("click");
    (
      document.querySelector(
        ".temporary-place-pin-add-prospect",
      ) as HTMLButtonElement
    ).click();

    expect(onAddProspect).toHaveBeenCalledTimes(1);
  });

  it("updates coordinates when the pin is dragged before opening the dialog", () => {
    const map = L.map("mapContainer").setView([-37.81, 144.96], 10);

    setTemporaryPlacePin(map, -37.5622, 143.8503, {
      label: "Ballarat, Victoria, Australia",
    });

    const marker = getTemporaryPlacePinLayer()?.getLayers()[0] as L.Marker;
    marker.setLatLng([-37.57, 143.86]);
    marker.fire("dragend");

    expect(getTemporaryPlacePin()?.latitude).toBeCloseTo(-37.57, 5);
    expect(getTemporaryPlacePin()?.longitude).toBeCloseTo(143.86, 5);
    expect(getTemporaryPlacePin()?.coordinatesWereDragged).toBe(true);
  });

  it("opens place actions for keyboard users without clicking the pin", () => {
    const map = L.map("mapContainer").setView([-37.81, 144.96], 10);

    setTemporaryPlacePin(map, -37.5622, 143.8503, {
      label: "Ballarat, Victoria, Australia",
    });

    openTemporaryPlacePinActions();

    expect(
      document.querySelector(".temporary-place-pin-add-prospect"),
    ).not.toBeNull();
  });

  it("does not clear the pin when the click target is the map search overlay", () => {
    const map = L.map("mapContainer").setView([-37.81, 144.96], 10);
    const searchHost = document.createElement("div");
    searchHost.className = "territory-map-search-host";
    const searchButton = document.createElement("button");
    searchButton.className = "territory-map-search-option";
    searchHost.appendChild(searchButton);
    document.getElementById("mapContainer")!.appendChild(searchHost);

    setTemporaryPlacePin(map, -37.5622, 143.8503, {
      label: "Ballarat, Victoria, Australia",
    });

    expect(shouldClearPlacePinOnMapClick(searchButton)).toBe(false);

    map.fire("click", {
      originalEvent: { target: searchButton },
    });

    expect(getTemporaryPlacePinLayer()).not.toBeNull();
  });
});
