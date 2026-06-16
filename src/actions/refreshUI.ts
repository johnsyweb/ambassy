import { populateChangesLogTable } from "@actions/populateChangesLogTable";
import { populateEventTeamsTable } from "@actions/populateEventTeamsTable";
import { populateMap } from "@actions/populateMap";
import { populateAmbassadorsTable } from "@actions/populateAmbassadorsTable";
import { populateProspectsTable } from "@actions/populateProspectsTable";
import { loadProspectiveEvents } from "@actions/persistProspectiveEvents";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventAmbassador } from "@models/EventAmbassador";
import { RegionalAmbassador } from "@models/RegionalAmbassador";
import { LogEntry } from "@models/LogEntry";
import { loadFromStorage } from "@utils/storage";
import { getCountriesSync } from "@models/country";
import { enrichEventTeamsWithLastAmbassadorVisit } from "./enrichEventTeamsWithLastAmbassadorVisit";
import { loadAmbassadorFinishHistories } from "./persistAmbassadorFinishHistory";
import { updateAmbassadorNameFilterStatus } from "./ambassadorNameFilterUI";
import { applyAmbassadorNameFilterToTables } from "@utils/ambassadorNameFilter";
import { applyAmbassadorNameFilterToMap } from "./populateMap";

/**
 * Which UI subsystems `refreshUI` rebuilds. Omitted flags default to `true`.
 *
 * - `tables` — event teams, ambassadors, prospects, and changes log tables
 * - `map` — Leaflet markers, Voronoi territories, and prospect markers
 */
export type RefreshScope = {
  map?: boolean;
  tables?: boolean;
};

/** Rebuild tables and map (default). */
export const REFRESH_ALL: RefreshScope = { map: true, tables: true };

/** Ambassador metadata, visit history, or log-only updates — skip map rebuild. */
export const REFRESH_TABLES_ONLY: RefreshScope = { map: false, tables: true };

function resolveRefreshScope(scope?: RefreshScope): Required<RefreshScope> {
  return {
    map: scope?.map !== false,
    tables: scope?.tables !== false,
  };
}

type RefreshContext = {
  eventDetails: EventDetailsMap;
  eventTeamsTableData: EventTeamsTableDataMap;
  log: LogEntry[];
  eventAmbassadors: EventAmbassadorMap;
  regionalAmbassadors: RegionalAmbassadorMap;
  prospectiveEvents: ReturnType<typeof loadProspectiveEvents>;
  prospectsList: ProspectiveEventList;
};

function loadAmbassadors(
  eventAmbassadors?: EventAmbassadorMap,
  regionalAmbassadors?: RegionalAmbassadorMap,
): Pick<RefreshContext, "eventAmbassadors" | "regionalAmbassadors"> {
  const eventAmbassadorsToUse =
    eventAmbassadors ??
    (() => {
      const stored =
        loadFromStorage<Array<[string, EventAmbassador]>>("eventAmbassadors");
      return stored
        ? new Map<string, EventAmbassador>(stored)
        : new Map<string, EventAmbassador>();
    })();

  const regionalAmbassadorsToUse =
    regionalAmbassadors ??
    (() => {
      const stored = loadFromStorage<Array<[string, RegionalAmbassador]>>(
        "regionalAmbassadors",
      );
      return stored
        ? new Map<string, RegionalAmbassador>(stored)
        : new Map<string, RegionalAmbassador>();
    })();

  return {
    eventAmbassadors: eventAmbassadorsToUse,
    regionalAmbassadors: regionalAmbassadorsToUse,
  };
}

function buildRefreshContext(
  eventDetails: EventDetailsMap,
  eventTeamsTableData: EventTeamsTableDataMap,
  log: LogEntry[],
  eventAmbassadors?: EventAmbassadorMap,
  regionalAmbassadors?: RegionalAmbassadorMap,
): RefreshContext {
  const ambassadors = loadAmbassadors(eventAmbassadors, regionalAmbassadors);
  const prospectiveEvents = loadProspectiveEvents();

  return {
    eventDetails,
    eventTeamsTableData,
    log,
    ...ambassadors,
    prospectiveEvents,
    prospectsList: new ProspectiveEventList(prospectiveEvents),
  };
}

function refreshTables(context: RefreshContext): void {
  const finishHistories = loadAmbassadorFinishHistories();

  enrichEventTeamsWithLastAmbassadorVisit(
    context.eventTeamsTableData,
    context.eventAmbassadors,
    context.regionalAmbassadors,
    finishHistories,
  );

  populateEventTeamsTable(context.eventTeamsTableData);

  const countries = getCountriesSync();

  populateAmbassadorsTable(
    context.eventAmbassadors,
    context.regionalAmbassadors,
    context.eventTeamsTableData,
    context.eventDetails,
    countries,
  );
  populateProspectsTable(
    context.prospectsList,
    context.eventAmbassadors,
    context.regionalAmbassadors,
    context.log,
    context.eventDetails,
  );
  populateChangesLogTable(context.log, context.eventDetails, countries);

  applyAmbassadorNameFilterToTables();
  updateAmbassadorNameFilterStatus({
    eventTeamsTableData: context.eventTeamsTableData,
    eventAmbassadors: context.eventAmbassadors,
    regionalAmbassadors: context.regionalAmbassadors,
    prospects: context.prospectsList,
  });
}

function refreshMap(context: RefreshContext): void {
  populateMap(
    context.eventTeamsTableData,
    context.eventDetails,
    context.eventAmbassadors,
    context.regionalAmbassadors,
    context.prospectiveEvents,
  );
  applyAmbassadorNameFilterToMap(context.eventTeamsTableData);
}

export function refreshUI(
  eventDetails: EventDetailsMap,
  eventTeamsTableData: EventTeamsTableDataMap,
  log: LogEntry[],
  eventAmbassadors?: EventAmbassadorMap,
  regionalAmbassadors?: RegionalAmbassadorMap,
  scope: RefreshScope = REFRESH_ALL,
) {
  if (!eventDetails || !eventTeamsTableData) {
    console.error("Event details are not available");
    return;
  }

  const resolvedScope = resolveRefreshScope(scope);
  const context = buildRefreshContext(
    eventDetails,
    eventTeamsTableData,
    log,
    eventAmbassadors,
    regionalAmbassadors,
  );

  if (resolvedScope.tables) {
    refreshTables(context);
  }

  if (resolvedScope.map) {
    refreshMap(context);
  }
}
