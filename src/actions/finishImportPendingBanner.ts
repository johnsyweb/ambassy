import {
  getPendingFinishImport,
  isFinishImportAutoPromptSuppressed,
} from "./processPendingFinishImport";
import { formatParkrunnerIdForDisplay } from "@utils/parkrunnerProfileUrl";

export function syncFinishImportPendingBanner(
  onResume: () => void,
  onDismiss: () => void,
  applicationDataLoaded: boolean,
): void {
  const banner = document.getElementById("finishImportPendingBanner");
  const message = document.getElementById("finishImportPendingBannerMessage");
  const resumeButton = document.getElementById(
    "finishImportPendingBannerResume",
  );
  const dismissButton = document.getElementById(
    "finishImportPendingBannerDismiss",
  );

  if (!banner || !message || !resumeButton || !dismissButton) {
    return;
  }

  const pending = getPendingFinishImport();
  const shouldShow =
    applicationDataLoaded &&
    pending !== null &&
    isFinishImportAutoPromptSuppressed();

  banner.hidden = !shouldShow;
  if (!shouldShow) {
    return;
  }

  message.textContent = `Finish import waiting for ${formatParkrunnerIdForDisplay(pending.parkrunnerId)}.`;

  resumeButton.replaceWith(resumeButton.cloneNode(true));
  dismissButton.replaceWith(dismissButton.cloneNode(true));

  document
    .getElementById("finishImportPendingBannerResume")
    ?.addEventListener("click", onResume);
  document
    .getElementById("finishImportPendingBannerDismiss")
    ?.addEventListener("click", onDismiss);
}
