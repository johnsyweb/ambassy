import { EventAmbassador } from "@models/EventAmbassador";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
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

/** One row from the Event Ambassadors CSV; extra columns are ignored after pick. */
export interface EventAmbassadorRow {
  "Event Ambassador": string;
  Events: string;
  "EA's Home parkrun"?: string;
  "parkrunner ID"?: string;
  "Parkrunner ID"?: string;
  [key: string]: string | undefined;
}

function pickEventAmbassadorRow(raw: EventAmbassadorRow): EventAmbassadorRow {
  return {
    "Event Ambassador": csvStringCell(raw["Event Ambassador"]),
    Events: csvStringCell(raw["Events"]),
    "EA's Home parkrun": csvStringCell(raw["EA's Home parkrun"]),
    "parkrunner ID": csvStringCell(
      raw["parkrunner ID"] ?? raw["Parkrunner ID"],
    ),
  };
}

export function parseEventAmbassadors(
  data: ReadonlyArray<EventAmbassadorRow>,
): EventAmbassadorMap {
  const eventAmbassadorsMap: EventAmbassadorMap = new Map<
    string,
    EventAmbassador
  >();
  let currentEA: EventAmbassador | null = null;

  data.forEach((raw) => {
    const row = pickEventAmbassadorRow(raw);
    const eaName = row["Event Ambassador"];
    const eventName = row["Events"];

    if (eaName) {
      if (currentEA) {
        eventAmbassadorsMap.set(currentEA.name, currentEA);
      }
      const homeParkrun = row["EA's Home parkrun"];
      const parkrunnerId = parseOptionalParkrunnerId(row["parkrunner ID"]);
      currentEA = {
        name: eaName,
        events: [],
        ...(homeParkrun ? { homeParkrun } : {}),
        ...(parkrunnerId ? { parkrunnerId } : {}),
      };
    }

    if (currentEA && eventName) {
      currentEA.events.push(eventName);
    }
  });

  if (currentEA) {
    eventAmbassadorsMap.set(currentEA["name"], currentEA);
  }

  return eventAmbassadorsMap;
}
