import {
  buildParkrunnerProfileUrl,
  formatParkrunnerIdForDisplay,
  getFinishExportUserscriptUrl,
  getTampermonkeyInstallUrl,
  isValidParkrunnerIdInput,
  normalizeParkrunnerIdForStorage,
  parkrunnerIdsMatch,
  stripParkrunnerIdPrefix,
} from "./parkrunnerProfileUrl";
import { FINISH_EXPORT_USERSCRIPT_METADATA } from "./finishExportUserscriptMetadata";

describe("parkrunnerProfileUrl", () => {
  const countries = {
    "3": {
      url: "www.parkrun.com.au",
      bounds: [0, 0, 0, 0] as [number, number, number, number],
    },
  };

  it("builds profile URLs from stored numeric IDs", () => {
    expect(buildParkrunnerProfileUrl("1001388", 3, countries)).toBe(
      "https://www.parkrun.com.au/parkrunner/1001388/all/",
    );
  });

  it("stores parkrunner IDs as digits only", () => {
    expect(normalizeParkrunnerIdForStorage("A1001388")).toBe("1001388");
    expect(normalizeParkrunnerIdForStorage("1001388")).toBe("1001388");
  });

  it("displays parkrunner IDs with an A prefix", () => {
    expect(formatParkrunnerIdForDisplay("1001388")).toBe("A1001388");
  });

  it("accepts prefixed or numeric input", () => {
    expect(isValidParkrunnerIdInput("A1001388")).toBe(true);
    expect(isValidParkrunnerIdInput("1001388")).toBe(true);
    expect(isValidParkrunnerIdInput("B1001388")).toBe(false);
  });

  it("matches stored and imported IDs", () => {
    expect(parkrunnerIdsMatch("1001388", "A1001388")).toBe(true);
    expect(stripParkrunnerIdPrefix("A1001388")).toBe("1001388");
  });

  it("uses the canonical Tampermonkey install URL in production", () => {
    expect(
      getTampermonkeyInstallUrl(
        getFinishExportUserscriptUrl("https://www.johnsy.com/ambassy/"),
      ),
    ).toBe(
      `https://www.tampermonkey.net/script_installation.php#url=${encodeURIComponent(FINISH_EXPORT_USERSCRIPT_METADATA.downloadUrl)}`,
    );
  });

  it("uses the local userscript URL for Tampermonkey install during development", () => {
    expect(getFinishExportUserscriptUrl("http://localhost:8081/")).toBe(
      "http://localhost:8081/script/ambassy-finish-export.user.js",
    );
    expect(
      getTampermonkeyInstallUrl(
        getFinishExportUserscriptUrl("http://localhost:8081/"),
      ),
    ).toBe(
      "https://www.tampermonkey.net/script_installation.php#url=http%3A%2F%2Flocalhost%3A8081%2Fscript%2Fambassy-finish-export.user.js",
    );
  });
});
