import {
  validateStateFile,
  validateStateFromUrl,
  validateStateFromClipboard,
  importApplicationState,
  InvalidFileFormatError,
  MissingFieldError,
  VersionMismatchError,
  InvalidDataError,
} from "./importState";

export async function handleStateImport(
  file?: File,
  url?: string,
  clipboardText?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const hasExistingData =
      localStorage.getItem("ambassy:eventAmbassadors") !== null ||
      localStorage.getItem("ambassy:eventTeams") !== null ||
      localStorage.getItem("ambassy:regionalAmbassadors") !== null;

      if (hasExistingData) {
        const confirmed = confirm(
          "Opening this saved state will replace your current data. Do you want to continue?"
        );
        if (!confirmed) {
          return { success: false, message: "Open cancelled" };
        }
      }

    let state;
    if (file) {
      state = await validateStateFile(file);
    } else if (url) {
      state = await validateStateFromUrl(url);
    } else if (clipboardText) {
      state = await validateStateFromClipboard(clipboardText);
    } else {
      return { success: false, message: "No saved state source provided" };
    }

    importApplicationState(state);

    const eventCount = state.data.eventTeams.length;
    const ambassadorCount = state.data.eventAmbassadors.length;
    return {
      success: true,
      message: `Saved state opened successfully! Loaded ${eventCount} event${
        eventCount !== 1 ? "s" : ""
      } and ${ambassadorCount} ambassador${
        ambassadorCount !== 1 ? "s" : ""
      }.`,
    };
  } catch (error) {
    let errorMessage = "Unable to open the saved state. ";
    if (error instanceof InvalidFileFormatError) {
      errorMessage +=
        "The format is not recognised. Please make sure you're opening a file that was saved from Ambassy.";
    } else if (error instanceof MissingFieldError) {
      errorMessage +=
        "The file appears to be incomplete. Please ask your colleague to share again.";
    } else if (error instanceof VersionMismatchError) {
      const versionMatch = error.message.match(/version (\d+\.\d+\.\d+)/);
      const version = versionMatch ? versionMatch[1] : "unknown";
      errorMessage += `This file was created with a different version of Ambassy (version ${version}). Please ask your colleague to share using the current version.`;
    } else if (error instanceof InvalidDataError) {
      errorMessage +=
        "The file data is not valid. Please make sure it hasn't been modified or corrupted.";
    } else {
      errorMessage +=
        error instanceof Error ? error.message : "An unexpected error occurred.";
    }
    return { success: false, message: errorMessage };
  }
}
