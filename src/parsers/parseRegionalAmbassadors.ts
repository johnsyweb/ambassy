import { RegionalAmbassador } from "@models/RegionalAmbassador";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { csvStringCell } from "@utils/csvField";
import { normalizeParkrunnerIdForStorage } from "@utils/parkrunnerProfileUrl";

function parseOptionalParkrunnerId(
  value: string | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  return normalizeParkrunnerIdForStorage(value);
}

/**
 * One row from the Regional Ambassadors CSV. Extra columns are ignored after pick.
 */
export interface RegionalAmbassadorRow {
  "RA Name": string;
  "RA State": string;
  "EA Name": string;
  "parkrunner ID"?: string;
  "Parkrunner ID"?: string;
  [key: string]: string | undefined;
}

function pickRegionalAmbassadorRow(
  raw: RegionalAmbassadorRow,
): RegionalAmbassadorRow {
  return {
    "RA Name": csvStringCell(raw["RA Name"]),
    "RA State": csvStringCell(raw["RA State"]),
    "EA Name": csvStringCell(raw["EA Name"]),
    "parkrunner ID": csvStringCell(
      raw["parkrunner ID"] ?? raw["Parkrunner ID"],
    ),
  };
}

export function parseRegionalAmbassadors(
  data: ReadonlyArray<RegionalAmbassadorRow>,
): RegionalAmbassadorMap {
  const regionalAmbassadorsMap: RegionalAmbassadorMap = new Map<
    string,
    RegionalAmbassador
  >();
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
        ...(row["parkrunner ID"]
          ? { parkrunnerId: parseOptionalParkrunnerId(row["parkrunner ID"]) }
          : {}),
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
