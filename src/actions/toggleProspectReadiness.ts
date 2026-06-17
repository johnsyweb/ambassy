import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { LogEntry } from "@models/LogEntry";
import { saveProspectiveEvents } from "./persistProspectiveEvents";
import { persistChangesLog } from "./persistState";
import { trackStateChange } from "./trackChanges";

export type ProspectReadinessField =
  | "courseFound"
  | "landownerPermission"
  | "fundingConfirmed";

const READINESS_FIELD_LABELS: Record<ProspectReadinessField, string> = {
  courseFound: "Course found",
  landownerPermission: "Landowner permission",
  fundingConfirmed: "Funding confirmed",
};

export function toggleProspectReadiness(
  prospectId: string,
  field: ProspectReadinessField,
  prospects: ProspectiveEventList,
  log: LogEntry[],
): void {
  const prospect = prospects.findById(prospectId);

  if (!prospect) {
    throw new Error(`Prospect with ID '${prospectId}' not found`);
  }

  const oldValue = prospect[field];
  const newValue = !oldValue;

  prospects.update({
    ...prospect,
    [field]: newValue,
  } satisfies ProspectiveEvent);

  saveProspectiveEvents(prospects.getAll());

  const label = READINESS_FIELD_LABELS[field];
  const changeEntry: LogEntry = {
    timestamp: Date.now(),
    type: "Prospect Readiness Updated",
    event: `Prospect "${prospect.prospectEvent}" (${prospect.country}, ${prospect.state}): ${label} changed from ${oldValue ? "yes" : "no"} to ${newValue ? "yes" : "no"}`,
    oldValue: oldValue ? "yes" : "no",
    newValue: newValue ? "yes" : "no",
  };

  log.unshift(changeEntry);
  persistChangesLog(log);
  trackStateChange();
}
