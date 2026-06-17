import {
  AmbassadorFinishHistoryMap,
  ambassadorFinishHistoryKey,
  parseAmbassadorFinishHistoryKey,
} from "@models/AmbassadorFinishHistory";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { formatLastAmbassadorVisit } from "@utils/formatAmbassadorVisitDate";

export const LAST_AMBASSADOR_VISIT_NOT_IMPORTED = "Not imported";
export const LAST_AMBASSADOR_VISIT_NONE_ON_RECORD = "No visit on record";

export function hasImportedVisitHistory(
  finishHistories: AmbassadorFinishHistoryMap,
): boolean {
  return Object.keys(finishHistories).length > 0;
}

export function computeLastAmbassadorVisitByEvent(
  eventShortNames: Iterable<string>,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  finishHistories: AmbassadorFinishHistoryMap,
): Map<string, string> {
  const ambassadorNamesByKey = buildAmbassadorNameIndex(
    eventAmbassadors,
    regionalAmbassadors,
  );
  const result = new Map<string, string>();

  for (const eventShortName of eventShortNames) {
    let latestDate: string | undefined;
    const ambassadorsOnLatestDate = new Set<string>();

    for (const [historyKey, history] of Object.entries(finishHistories)) {
      const ambassadorRef = parseAmbassadorFinishHistoryKey(historyKey);
      const ambassadorName = ambassadorRef
        ? ambassadorNamesByKey.get(historyKey)
        : undefined;
      if (!ambassadorRef || !ambassadorName) {
        continue;
      }

      const finishDate = history.finishesByEvent[eventShortName];
      if (!finishDate) {
        continue;
      }

      if (!latestDate || finishDate > latestDate) {
        latestDate = finishDate;
        ambassadorsOnLatestDate.clear();
        ambassadorsOnLatestDate.add(ambassadorName);
      } else if (finishDate === latestDate) {
        ambassadorsOnLatestDate.add(ambassadorName);
      }
    }

    if (!latestDate || ambassadorsOnLatestDate.size === 0) {
      result.set(eventShortName, LAST_AMBASSADOR_VISIT_NONE_ON_RECORD);
      continue;
    }

    result.set(
      eventShortName,
      formatLastAmbassadorVisit([...ambassadorsOnLatestDate], latestDate),
    );
  }

  return result;
}

function buildAmbassadorNameIndex(
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
): Map<string, string> {
  const names = new Map<string, string>();

  for (const name of eventAmbassadors.keys()) {
    names.set(ambassadorFinishHistoryKey("ea", name), name);
  }

  for (const name of regionalAmbassadors.keys()) {
    names.set(ambassadorFinishHistoryKey("rea", name), name);
  }

  return names;
}
