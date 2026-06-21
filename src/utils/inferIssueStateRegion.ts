import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";

export function inferIssueStateRegion(
  eventAmbassadorName: string,
  regionalAmbassadorName: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
): string {
  const eventAmbassador = eventAmbassadors.get(eventAmbassadorName);
  if (eventAmbassador?.state?.trim()) {
    return eventAmbassador.state.trim();
  }

  const regionalAmbassador = regionalAmbassadors.get(regionalAmbassadorName);
  if (regionalAmbassador?.state?.trim()) {
    return regionalAmbassador.state.trim();
  }

  return "";
}
