import { ApplicationState } from "@models/ApplicationState";
import { saveToStorage } from "@utils/storage";
import {
  saveCapacityLimits,
  validateCapacityLimits,
} from "./configureCapacityLimits";
import { parseDataUrl } from "@utils/urlSharing";
import { markDataImported } from "./showImportGuidance";

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

  markDataImported();
}

export async function validateStateFromUrl(dataUrl: string): Promise<ApplicationState> {
  try {
    const jsonString = parseDataUrl(dataUrl);
    const parsed = JSON.parse(jsonString);
    return validateApplicationState(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new InvalidFileFormatError("URL does not contain valid JSON data");
    }
    throw error;
  }
}

export async function validateStateFromClipboard(text: string): Promise<ApplicationState> {
  try {
    const parsed = JSON.parse(text);
    return validateApplicationState(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new InvalidFileFormatError("Clipboard data is not valid JSON");
    }
    throw error;
  }
}

function validateApplicationState(parsed: unknown): ApplicationState {
  if (!parsed || typeof parsed !== "object") {
    throw new InvalidFileFormatError("Invalid state format");
  }

  const state = parsed as Record<string, unknown>;

  if (!state.version) {
    throw new MissingFieldError("File is missing required 'version' field");
  }

  if (state.version !== "1.0.0") {
    throw new VersionMismatchError(
      `File version ${state.version} is incompatible. Expected version 1.0.0`,
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

  return state as unknown as ApplicationState;
}
