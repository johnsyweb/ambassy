import {
  clearFinishImportAutoPromptSuppress,
  suppressFinishImportAutoPrompt,
  storePendingFinishImport,
} from "./processPendingFinishImport";
import { formatParkrunnerIdForDisplay } from "@utils/parkrunnerProfileUrl";
import { syncFinishImportPendingBanner } from "./finishImportPendingBanner";

describe("syncFinishImportPendingBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = `
      <div id="finishImportPendingBanner" hidden>
        <p id="finishImportPendingBannerMessage"></p>
        <button type="button" id="finishImportPendingBannerResume">Resume</button>
        <button type="button" id="finishImportPendingBannerDismiss">Dismiss</button>
      </div>
    `;
    clearFinishImportAutoPromptSuppress();
  });

  it("shows the banner when a suppressed pending finish import exists", () => {
    storePendingFinishImport({
      schemaVersion: 1,
      parkrunnerId: "1234567",
      sourceUrl: "https://example.test/parkrunner/1234567/all/",
      importedAt: "2026-06-16T00:00:00.000Z",
      finishes: [],
    });
    suppressFinishImportAutoPrompt();

    syncFinishImportPendingBanner(jest.fn(), jest.fn(), true);

    const banner = document.getElementById("finishImportPendingBanner");
    expect(banner?.hidden).toBe(false);
    expect(
      document.getElementById("finishImportPendingBannerMessage")?.textContent,
    ).toContain(formatParkrunnerIdForDisplay("1234567"));
  });

  it("hides the banner when application data is not loaded", () => {
    storePendingFinishImport({
      schemaVersion: 1,
      parkrunnerId: "1234567",
      sourceUrl: "https://example.test/parkrunner/1234567/all/",
      importedAt: "2026-06-16T00:00:00.000Z",
      finishes: [],
    });
    suppressFinishImportAutoPrompt();

    syncFinishImportPendingBanner(jest.fn(), jest.fn(), false);

    expect(document.getElementById("finishImportPendingBanner")?.hidden).toBe(
      true,
    );
  });
});
