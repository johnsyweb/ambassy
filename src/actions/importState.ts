import { ApplicationState } from "@models/ApplicationState";
import { saveToStorage } from "@utils/storage";

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

        if (!parsed.version) {
          reject(new MissingFieldError("File is missing required 'version' field"));
          return;
        }

        if (parsed.version !== "1.0.0") {
          reject(
            new VersionMismatchError(
              `File version ${parsed.version} is incompatible. Expected version 1.0.0`
            )
          );
          return;
        }

        if (!parsed.exportedAt) {
          reject(new MissingFieldError("File is missing required 'exportedAt' field"));
          return;
        }

        if (!parsed.data) {
          reject(new MissingFieldError("File is missing required 'data' field"));
          return;
        }

        const { data } = parsed;

        if (!Array.isArray(data.eventAmbassadors)) {
          reject(new InvalidDataError("File data.eventAmbassadors must be an array"));
          return;
        }

        if (!Array.isArray(data.eventTeams)) {
          reject(new InvalidDataError("File data.eventTeams must be an array"));
          return;
        }

        if (!Array.isArray(data.regionalAmbassadors)) {
          reject(new InvalidDataError("File data.regionalAmbassadors must be an array"));
          return;
        }

        if (!Array.isArray(data.changesLog)) {
          reject(new InvalidDataError("File data.changesLog must be an array"));
          return;
        }

        resolve(parsed as ApplicationState);
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
}

