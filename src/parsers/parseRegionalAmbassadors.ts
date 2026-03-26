import { RegionalAmbassador } from "@models/RegionalAmbassador";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { csvStringCell } from "@utils/csvField";

export interface RegionalAmbassadorRow {
  "RA Name": string;
  "RA State": string;
  "EA Name": string;
}

function pickRegionalAmbassadorRow(
  raw: Record<string, unknown>,
): RegionalAmbassadorRow {
  return {
    "RA Name": csvStringCell(raw["RA Name"]),
    "RA State": csvStringCell(raw["RA State"]),
    "EA Name": csvStringCell(raw["EA Name"]),
  };
}

export function parseRegionalAmbassadors(
  data: ReadonlyArray<Record<string, unknown>>,
): RegionalAmbassadorMap {
  const regionalAmbassadorsMap: RegionalAmbassadorMap = new Map<string, RegionalAmbassador>();
  let currentRA: RegionalAmbassador | null = null;

  data.forEach((raw) => {
    const row = pickRegionalAmbassadorRow(raw);
    const raName = row["RA Name"];
    const raState = row["RA State"];
    const eaName = row["EA Name"];

    if (raName) {
      if (currentRA) {
        regionalAmbassadorsMap.set(currentRA.name, currentRA);
      }
      currentRA = {
        name: raName,
        state: raState,
        supportsEAs: [],
      };
    }

    if (currentRA && eaName) {
      currentRA.supportsEAs.push(eaName);
    }
  });

  // Save the last RA if it exists
  if (currentRA !== null) {
    const finalRA: RegionalAmbassador = currentRA;
    regionalAmbassadorsMap.set(finalRA.name, finalRA);
  }

  return regionalAmbassadorsMap;
}