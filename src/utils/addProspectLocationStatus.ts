import { Coordinate, formatCoordinate } from "@models/Coordinate";

export type AddProspectLocationStatusKind =
  | "loading"
  | "success"
  | "choose-place"
  | "hidden";

export function getAddProspectLocationStatusClassName(
  kind: Exclude<AddProspectLocationStatusKind, "hidden">,
): string {
  return `add-prospect-location-status add-prospect-location-status--${kind}`;
}

export function renderAddProspectLocationStatusMessage(
  kind: Exclude<AddProspectLocationStatusKind, "hidden">,
  options: {
    coordinate?: Coordinate;
    country?: string;
    placeCount?: number;
  } = {},
): string {
  switch (kind) {
    case "loading":
      return "Looking up location…";
    case "success": {
      if (!options.coordinate || !options.country) {
        return "Location found.";
      }

      return `Location found. Coordinates: ${formatCoordinate(options.coordinate)}. Country: ${options.country}.`;
    }
    case "choose-place": {
      const count = options.placeCount ?? 0;
      if (count === 1) {
        return "One matching place found — choose it below.";
      }

      return `${count} matching places found — choose one below.`;
    }
  }
}
