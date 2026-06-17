export function resolveProspectGeocodingStatus(options: {
  coordinatesEnteredManually: boolean;
  coordinatesFromPinDrag: boolean;
}): "manual" | "success" {
  if (options.coordinatesEnteredManually || options.coordinatesFromPinDrag) {
    return "manual";
  }

  return "success";
}
