import {
  ApplicationState,
  SUPPORTED_APPLICATION_STATE_VERSIONS,
} from "@models/ApplicationState";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { AmbassadorFinishHistoryMap } from "@models/AmbassadorFinishHistory";
import { saveToStorage } from "@utils/storage";
import {
  saveCapacityLimits,
  validateCapacityLimits,
} from "./configureCapacityLimits";
import { markDataImported } from "./showImportGuidance";
import { invalidateEventsCatalogueMemoryCache } from "./fetchEvents";
import { saveProspectiveEvents } from "./persistProspectiveEvents";
import { persistAmbassadorFinishHistories } from "./persistAmbassadorFinishHistory";

export class InvalidFileFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFileFormatError";
  }
}

export class MissingFieldError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingFieldError";
  }
}

export class VersionMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VersionMismatchError";
  }
}

export class InvalidDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDataError";
  }
}

export async function validateStateFile(file: File): Promise<ApplicationState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        resolve(validateApplicationState(parsed));
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new InvalidFileFormatError("File is not valid JSON"));
        } else {
          reject(error);
        }
      }
    };

    reader.onerror = () => {
      reject(new InvalidFileFormatError("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

function restoreProspectiveEventDates(
  events: ProspectiveEvent[],
): ProspectiveEvent[] {
  return events.map((event) => ({
    ...event,
    dateMadeContact: event.dateMadeContact
      ? new Date(event.dateMadeContact)
      : null,
  }));
}

export function importApplicationState(state: ApplicationState): void {
  saveToStorage("eventAmbassadors", state.data.eventAmbassadors);
  saveToStorage("eventTeams", state.data.eventTeams);
  saveToStorage("regionalAmbassadors", state.data.regionalAmbassadors);
  saveToStorage("changesLog", state.data.changesLog);

  if (
    state.data.capacityLimits &&
    validateCapacityLimits(state.data.capacityLimits)
  ) {
    saveCapacityLimits(state.data.capacityLimits);
  }

  saveProspectiveEvents(
    restoreProspectiveEventDates(state.data.prospectiveEvents ?? []),
  );
  persistAmbassadorFinishHistories(state.data.ambassadorFinishHistories ?? {});

  if (
    state.data.resolvedEventDetails &&
    state.data.resolvedEventDetails.length > 0
  ) {
    const CACHE_KEY = "parkrun events";
    const existingCache = localStorage.getItem(CACHE_KEY);
    let eventDetailsMap = new Map<
      string,
      import("@models/EventDetails").EventDetails
    >();

    if (existingCache) {
      try {
        const parsed = JSON.parse(existingCache);
        if (parsed.eventDetailsMap && Array.isArray(parsed.eventDetailsMap)) {
          eventDetailsMap = new Map(parsed.eventDetailsMap);
        }
      } catch {
        // Ignore parse errors, start with empty map
      }
    }

    state.data.resolvedEventDetails.forEach(([key, eventDetails]) => {
      eventDetailsMap.set(key, eventDetails);
    });

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        eventDetailsMap: Array.from(eventDetailsMap.entries()),
      }),
    );
    invalidateEventsCatalogueMemoryCache();
  }

  markDataImported();
}

function validateApplicationState(parsed: unknown): ApplicationState {
  if (!parsed || typeof parsed !== "object") {
    throw new InvalidFileFormatError("Invalid state format");
  }

  const state = parsed as Record<string, unknown>;

  if (!state.version) {
    throw new MissingFieldError("File is missing required 'version' field");
  }

  if (
    typeof state.version !== "string" ||
    !SUPPORTED_APPLICATION_STATE_VERSIONS.includes(
      state.version as (typeof SUPPORTED_APPLICATION_STATE_VERSIONS)[number],
    )
  ) {
    throw new VersionMismatchError(
      `File version ${String(state.version)} is incompatible. Expected version ${SUPPORTED_APPLICATION_STATE_VERSIONS.join(" or ")}`,
    );
  }

  if (!state.exportedAt) {
    throw new MissingFieldError("File is missing required 'exportedAt' field");
  }

  if (!state.data) {
    throw new MissingFieldError("File is missing required 'data' field");
  }

  const { data } = state;

  if (!data || typeof data !== "object") {
    throw new InvalidDataError("File data field is invalid");
  }

  const dataObj = data as Record<string, unknown>;

  if (!Array.isArray(dataObj.eventAmbassadors)) {
    throw new InvalidDataError("File data.eventAmbassadors must be an array");
  }

  if (!Array.isArray(dataObj.eventTeams)) {
    throw new InvalidDataError("File data.eventTeams must be an array");
  }

  if (!Array.isArray(dataObj.regionalAmbassadors)) {
    throw new InvalidDataError(
      "File data.regionalAmbassadors must be an array",
    );
  }

  if (!Array.isArray(dataObj.changesLog)) {
    throw new InvalidDataError("File data.changesLog must be an array");
  }

  if (
    dataObj.resolvedEventDetails !== undefined &&
    !Array.isArray(dataObj.resolvedEventDetails)
  ) {
    throw new InvalidDataError(
      "File data.resolvedEventDetails must be an array if present",
    );
  }

  if (
    dataObj.prospectiveEvents !== undefined &&
    !Array.isArray(dataObj.prospectiveEvents)
  ) {
    throw new InvalidDataError(
      "File data.prospectiveEvents must be an array if present",
    );
  }

  if (
    dataObj.ambassadorFinishHistories !== undefined &&
    (typeof dataObj.ambassadorFinishHistories !== "object" ||
      dataObj.ambassadorFinishHistories === null ||
      Array.isArray(dataObj.ambassadorFinishHistories))
  ) {
    throw new InvalidDataError(
      "File data.ambassadorFinishHistories must be an object if present",
    );
  }

  return {
    version: state.version as string,
    exportedAt: state.exportedAt as string,
    data: {
      eventAmbassadors:
        dataObj.eventAmbassadors as ApplicationState["data"]["eventAmbassadors"],
      eventTeams: dataObj.eventTeams as ApplicationState["data"]["eventTeams"],
      regionalAmbassadors:
        dataObj.regionalAmbassadors as ApplicationState["data"]["regionalAmbassadors"],
      changesLog: dataObj.changesLog as ApplicationState["data"]["changesLog"],
      capacityLimits:
        dataObj.capacityLimits as ApplicationState["data"]["capacityLimits"],
      resolvedEventDetails:
        dataObj.resolvedEventDetails as ApplicationState["data"]["resolvedEventDetails"],
      prospectiveEvents:
        (dataObj.prospectiveEvents as ProspectiveEvent[] | undefined) ?? [],
      ambassadorFinishHistories:
        (dataObj.ambassadorFinishHistories as
          | AmbassadorFinishHistoryMap
          | undefined) ?? {},
    },
  };
}
