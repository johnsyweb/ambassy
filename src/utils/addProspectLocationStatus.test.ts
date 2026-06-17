import {
  getAddProspectLocationStatusClassName,
  renderAddProspectLocationStatusMessage,
} from "./addProspectLocationStatus";
import { createCoordinate } from "@models/Coordinate";

describe("addProspectLocationStatus", () => {
  it("renders a loading message", () => {
    expect(renderAddProspectLocationStatusMessage("loading")).toBe(
      "Looking up location…",
    );
  });

  it("renders success with coordinates and country", () => {
    const coordinate = createCoordinate(-37.787, 145.123);
    const message = renderAddProspectLocationStatusMessage("success", {
      coordinate,
      country: "AU",
    });

    expect(message).toContain("Location found. Coordinates:");
    expect(message).toContain("Country: AU.");
    expect(message).toContain("37.78700° S");
  });

  it("renders choose-place guidance with a count", () => {
    expect(
      renderAddProspectLocationStatusMessage("choose-place", {
        placeCount: 3,
      }),
    ).toBe("3 matching places found — choose one below.");
  });

  it("maps status kinds to CSS class names", () => {
    expect(getAddProspectLocationStatusClassName("loading")).toBe(
      "add-prospect-location-status add-prospect-location-status--loading",
    );
  });
});
