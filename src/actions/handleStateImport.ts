import {
  validateStateFile,
  importApplicationState,
  InvalidFileFormatError,
  MissingFieldError,
  VersionMismatchError,
  InvalidDataError,
} from "./importState";
import { hasUnsavedChanges } from "./trackChanges";

function hasExistingApplicationData(): boolean {
  return (
    localStorage.getItem("ambassy:eventAmbassadors") !== null ||
    localStorage.getItem("ambassy:eventTeams") !== null ||
    localStorage.getItem("ambassy:regionalAmbassadors") !== null
  );
}

export async function handleStateImport(
  file: File,
): Promise<{ success: boolean; message: string }> {
  try {
    if (hasExistingApplicationData() || hasUnsavedChanges()) {
      const confirmed = confirm(
        "Importing this file will replace your current Ambassy data on this device. Do you want to continue?",
      );
      if (!confirmed) {
        return { success: false, message: "Import cancelled" };
      }
    }

    const state = await validateStateFile(file);
    importApplicationState(state);

    const eventCount = state.data.eventTeams.length;
    const ambassadorCount = state.data.eventAmbassadors.length;
    return {
      success: true,
      message: `State imported successfully. Loaded ${eventCount} event${
        eventCount !== 1 ? "s" : ""
      } and ${ambassadorCount} ambassador${ambassadorCount !== 1 ? "s" : ""}.`,
    };
  } catch (error) {
    let errorMessage = "Unable to import the state file. ";
    if (error instanceof InvalidFileFormatError) {
      errorMessage +=
        "The format is not recognised. Please make sure you are importing a file that was exported from Ambassy.";
    } else if (error instanceof MissingFieldError) {
      errorMessage +=
        "The file appears to be incomplete. Please ask your colleague to export again.";
    } else if (error instanceof VersionMismatchError) {
      const versionMatch = error.message.match(/version (\S+)/);
      const version = versionMatch ? versionMatch[1] : "unknown";
      errorMessage += `This file was created with a different version of Ambassy (version ${version}). Please ask your colleague to export using the current version.`;
    } else if (error instanceof InvalidDataError) {
      errorMessage +=
        "The file data is not valid. Please make sure it has not been modified or corrupted.";
    } else {
      errorMessage +=
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
    }
    return { success: false, message: errorMessage };
  }
}
