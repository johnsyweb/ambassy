import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { getActiveFilterableTabLabel } from "@utils/tabs";
import {
  applyAmbassadorNameFilterToTables,
  clearAmbassadorNameFilter,
  countEventAmbassadorsMatchingFilter,
  countEventTeamsMatchingFilter,
  countProspectsMatchingFilter,
  countRegionalAmbassadorsMatchingFilter,
  formatAmbassadorNameFilterStatus,
  getAmbassadorNameFilter,
  setAmbassadorNameFilter,
} from "@utils/ambassadorNameFilter";
import { applyAmbassadorNameFilterToMap } from "./populateMap";

export type AmbassadorNameFilterRefreshContext = {
  eventTeamsTableData: EventTeamsTableDataMap;
  eventAmbassadors: EventAmbassadorMap;
  regionalAmbassadors: RegionalAmbassadorMap;
  prospects: ProspectiveEventList;
};

let refreshCallback: (() => void) | null = null;
let filterApplyTimer: ReturnType<typeof setTimeout> | null = null;
const FILTER_APPLY_DEBOUNCE_MS = 100;

function isTextInputElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

export function applyAmbassadorNameFilterToViews(
  context: AmbassadorNameFilterRefreshContext,
): void {
  applyAmbassadorNameFilterToTables();
  applyAmbassadorNameFilterToMap(context.eventTeamsTableData);
  updateAmbassadorNameFilterStatus(context);
}

function scheduleAmbassadorNameFilterApply(
  context: AmbassadorNameFilterRefreshContext,
): void {
  if (filterApplyTimer) {
    clearTimeout(filterApplyTimer);
  }

  filterApplyTimer = setTimeout(() => {
    filterApplyTimer = null;
    applyAmbassadorNameFilterToViews(context);
  }, FILTER_APPLY_DEBOUNCE_MS);
}

export function initializeAmbassadorNameFilter(
  contextProvider: () => AmbassadorNameFilterRefreshContext | null,
): void {
  const runApply = (immediate: boolean) => {
    const context = contextProvider();
    if (!context) {
      return;
    }

    if (immediate) {
      if (filterApplyTimer) {
        clearTimeout(filterApplyTimer);
        filterApplyTimer = null;
      }
      applyAmbassadorNameFilterToViews(context);
      return;
    }

    updateAmbassadorNameFilterStatus(context);
    scheduleAmbassadorNameFilterApply(context);
  };

  refreshCallback = () => runApply(true);

  const input = document.getElementById(
    "ambassadorNameFilterInput",
  ) as HTMLInputElement | null;
  const clearButton = document.getElementById(
    "ambassadorNameFilterClear",
  ) as HTMLButtonElement | null;

  if (!input || !clearButton) {
    console.error("Ambassador name filter elements not found");
    return;
  }

  input.value = getAmbassadorNameFilter();

  input.addEventListener("input", () => {
    setAmbassadorNameFilter(input.value);
    runApply(false);
  });

  clearButton.addEventListener("click", () => {
    clearAmbassadorNameFilter();
    input.value = "";
    runApply(true);
    input.focus();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && input.value.trim().length > 0) {
      event.preventDefault();
      clearAmbassadorNameFilter();
      input.value = "";
      runApply(true);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (isTextInputElement(event.target)) {
      return;
    }

    event.preventDefault();
    input.focus();
    input.select();
  });
}

export function updateAmbassadorNameFilterStatus(
  context: AmbassadorNameFilterRefreshContext,
): void {
  const status = document.getElementById("ambassadorNameFilterStatus");
  if (!status) {
    return;
  }

  const filter = getAmbassadorNameFilter();
  const tabLabel = getActiveFilterableTabLabel();
  const prospects = context.prospects.getAll();

  const counts = (() => {
    switch (tabLabel) {
      case "Event Ambassadors":
        return countEventAmbassadorsMatchingFilter(
          context.eventAmbassadors,
          filter,
        );
      case "Regional Ambassadors":
        return countRegionalAmbassadorsMatchingFilter(
          context.regionalAmbassadors,
          filter,
        );
      case "Prospects":
        return countProspectsMatchingFilter(
          prospects,
          context.eventAmbassadors,
          filter,
        );
      case "Event Teams":
      default:
        return countEventTeamsMatchingFilter(
          context.eventTeamsTableData,
          filter,
        );
    }
  })();

  status.textContent = formatAmbassadorNameFilterStatus(
    tabLabel,
    counts.visible,
    counts.total,
    filter,
  );
}

export function refreshAmbassadorNameFilterStatusFromCallback(): void {
  if (refreshCallback) {
    refreshCallback();
  }
}
