import L from "leaflet";
import {
  clearTemporaryPlacePin,
  getTemporaryPlacePinLayer,
  setTemporaryPlacePin,
} from "./temporaryPlacePin";

describe("temporaryPlacePin", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="mapContainer"></div>';
    clearTemporaryPlacePin();
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
});
