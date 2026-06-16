import {
  EventTeamsTableData,
  EventTeamsTableDataMap,
} from "@models/EventTeamsTableData";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { ProspectiveEvent } from "@models/ProspectiveEvent";

export const AMBASSADOR_NAME_FILTER_SESSION_KEY =
  "ambassy:ambassadorNameFilter";

export function buildAmbassadorFilterText(
  ...fieldValues: Array<string | undefined>
): string {
  return fieldValues
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();
}

export function rowMatchesAmbassadorFilterText(
  filterText: string,
  filter: string,
): boolean {
  if (!isAmbassadorNameFilterActive(filter)) {
    return true;
  }

  return filterText.includes(filter.trim().toLowerCase());
}

export function applyAmbassadorNameFilterToTables(): void {
  const filter = getAmbassadorNameFilter();
  const filterActive = isAmbassadorNameFilterActive(filter);
  const needle = filter.trim().toLowerCase();

  document
    .querySelectorAll<HTMLTableRowElement>("tr[data-ambassador-filter-text]")
    .forEach((row) => {
      const filterText = row.dataset.ambassadorFilterText ?? "";
      row.hidden = filterActive && !filterText.includes(needle);
    });
}

export function isAmbassadorNameFilterActive(filter: string): boolean {
  return filter.trim().length > 0;
}

export function ambassadorNameFieldMatches(
  fieldValue: string | undefined,
  filter: string,
): boolean {
  if (!isAmbassadorNameFilterActive(filter)) {
    return true;
  }

  if (!fieldValue) {
    return false;
  }

  return fieldValue.toLowerCase().includes(filter.trim().toLowerCase());
}

export function anyAmbassadorNameFieldMatches(
  fieldValues: Array<string | undefined>,
  filter: string,
): boolean {
  if (!isAmbassadorNameFilterActive(filter)) {
    return true;
  }

  return fieldValues.some((value) => ambassadorNameFieldMatches(value, filter));
}

export function eventTeamRowMatchesAmbassadorNameFilter(
  data: EventTeamsTableData,
  filter: string,
): boolean {
  return anyAmbassadorNameFieldMatches(
    [data.regionalAmbassador, data.eventAmbassador],
    filter,
  );
}

export function eventAmbassadorRowMatchesAmbassadorNameFilter(
  eventAmbassadorName: string,
  regionalAmbassadorName: string | undefined,
  filter: string,
): boolean {
  return anyAmbassadorNameFieldMatches(
    [eventAmbassadorName, regionalAmbassadorName],
    filter,
  );
}

export function regionalAmbassadorRowMatchesAmbassadorNameFilter(
  regionalAmbassadorName: string,
  supportedEventAmbassadors: string[],
  filter: string,
): boolean {
  return anyAmbassadorNameFieldMatches(
    [regionalAmbassadorName, ...supportedEventAmbassadors],
    filter,
  );
}

export function prospectRowMatchesAmbassadorNameFilter(
  eventAmbassadorName: string | undefined,
  filter: string,
): boolean {
  return ambassadorNameFieldMatches(eventAmbassadorName, filter);
}

export function getAmbassadorNameFilter(): string {
  return sessionStorage.getItem(AMBASSADOR_NAME_FILTER_SESSION_KEY) ?? "";
}

export function setAmbassadorNameFilter(value: string): void {
  sessionStorage.setItem(AMBASSADOR_NAME_FILTER_SESSION_KEY, value);
}

export function clearAmbassadorNameFilter(): void {
  sessionStorage.removeItem(AMBASSADOR_NAME_FILTER_SESSION_KEY);
}

export function countEventTeamsMatchingFilter(
  eventTeamsTableData: EventTeamsTableDataMap,
  filter: string,
): { visible: number; total: number } {
  const total = eventTeamsTableData.size;
  if (!isAmbassadorNameFilterActive(filter)) {
    return { visible: total, total };
  }

  let visible = 0;
  eventTeamsTableData.forEach((row) => {
    if (eventTeamRowMatchesAmbassadorNameFilter(row, filter)) {
      visible += 1;
    }
  });

  return { visible, total };
}

export function countEventAmbassadorsMatchingFilter(
  eventAmbassadors: EventAmbassadorMap,
  filter: string,
): { visible: number; total: number } {
  const total = eventAmbassadors.size;
  if (!isAmbassadorNameFilterActive(filter)) {
    return { visible: total, total };
  }

  let visible = 0;
  eventAmbassadors.forEach((ambassador, name) => {
    if (
      eventAmbassadorRowMatchesAmbassadorNameFilter(
        name,
        ambassador.regionalAmbassador,
        filter,
      )
    ) {
      visible += 1;
    }
  });

  return { visible, total };
}

export function countRegionalAmbassadorsMatchingFilter(
  regionalAmbassadors: RegionalAmbassadorMap,
  filter: string,
): { visible: number; total: number } {
  const total = regionalAmbassadors.size;
  if (!isAmbassadorNameFilterActive(filter)) {
    return { visible: total, total };
  }

  let visible = 0;
  regionalAmbassadors.forEach((ambassador, name) => {
    if (
      regionalAmbassadorRowMatchesAmbassadorNameFilter(
        name,
        ambassador.supportsEAs,
        filter,
      )
    ) {
      visible += 1;
    }
  });

  return { visible, total };
}

export function countProspectsMatchingFilter(
  prospects: ProspectiveEvent[],
  filter: string,
): { visible: number; total: number } {
  const total = prospects.length;
  if (!isAmbassadorNameFilterActive(filter)) {
    return { visible: total, total };
  }

  let visible = 0;
  prospects.forEach((prospect) => {
    if (
      prospectRowMatchesAmbassadorNameFilter(prospect.eventAmbassador, filter)
    ) {
      visible += 1;
    }
  });

  return { visible, total };
}

export type FilterableTabLabel =
  | "Event Teams"
  | "Event Ambassadors"
  | "Regional Ambassadors"
  | "Prospects";

export function formatAmbassadorNameFilterStatus(
  tabLabel: FilterableTabLabel,
  visible: number,
  total: number,
  filter: string,
): string {
  if (!isAmbassadorNameFilterActive(filter)) {
    return `${total} ${tabLabel.toLowerCase()} rows`;
  }

  return `Showing ${visible} of ${total} ${tabLabel.toLowerCase()} rows`;
}
