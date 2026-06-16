import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { AmbassadorFinishHistoryMap } from "@models/AmbassadorFinishHistory";
import { computeLastAmbassadorVisitByEvent } from "@utils/computeLastAmbassadorVisit";

export function enrichEventTeamsWithLastAmbassadorVisit(
  eventTeamsTableData: EventTeamsTableDataMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  finishHistories: AmbassadorFinishHistoryMap,
): void {
  const visits = computeLastAmbassadorVisitByEvent(
    eventTeamsTableData.keys(),
    eventAmbassadors,
    regionalAmbassadors,
    finishHistories,
  );

  for (const [eventShortName, data] of eventTeamsTableData) {
    data.lastAmbassadorVisit = visits.get(eventShortName) ?? "N/A";
  }
}
