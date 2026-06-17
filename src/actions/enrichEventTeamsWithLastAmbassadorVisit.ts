import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { AmbassadorFinishHistoryMap } from "@models/AmbassadorFinishHistory";
import {
  computeLastAmbassadorVisitByEvent,
  hasImportedVisitHistory,
  LAST_AMBASSADOR_VISIT_NOT_IMPORTED,
} from "@utils/computeLastAmbassadorVisit";

export function enrichEventTeamsWithLastAmbassadorVisit(
  eventTeamsTableData: EventTeamsTableDataMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  finishHistories: AmbassadorFinishHistoryMap,
): void {
  if (!hasImportedVisitHistory(finishHistories)) {
    for (const data of eventTeamsTableData.values()) {
      data.lastAmbassadorVisit = LAST_AMBASSADOR_VISIT_NOT_IMPORTED;
    }
    return;
  }

  const visits = computeLastAmbassadorVisitByEvent(
    eventTeamsTableData.keys(),
    eventAmbassadors,
    regionalAmbassadors,
    finishHistories,
  );

  for (const [eventShortName, data] of eventTeamsTableData) {
    data.lastAmbassadorVisit = visits.get(eventShortName)!;
  }
}
