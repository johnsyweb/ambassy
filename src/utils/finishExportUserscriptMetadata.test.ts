import fs from "fs";
import path from "path";
import {
  buildFinishExportUserscriptMatches,
  parseUserscriptMatchLines,
} from "./finishExportUserscriptMatches";
import {
  buildFinishExportUserscriptHeader,
  FINISH_EXPORT_USERSCRIPT_GITHUB_RAW_URL,
  FINISH_EXPORT_USERSCRIPT_METADATA,
  getFinishExportUserscriptInstallUrl,
  parseUserscriptHeaderValue,
  parseUserscriptHeaderValues,
} from "./finishExportUserscriptMetadata";

const fixturePath = path.resolve(
  __dirname,
  "../../script/fixtures/parkrun-country-hosts.json",
);
const userscriptPath = path.resolve(
  __dirname,
  "../../public/script/ambassy-finish-export.user.js",
);

const expectedCountryHosts = JSON.parse(
  fs.readFileSync(fixturePath, "utf8"),
) as string[];

describe("finishExportUserscriptMetadata", () => {
  it("builds Tampermonkey metadata headers for automatic updates", () => {
    const header = buildFinishExportUserscriptHeader([
      "*://www.parkrun.com.au/parkrunner/*/all*",
    ]);

    expect(header).toContain(
      `// @downloadURL  ${FINISH_EXPORT_USERSCRIPT_GITHUB_RAW_URL}`,
    );
    expect(header).toContain(
      `// @updateURL    ${FINISH_EXPORT_USERSCRIPT_GITHUB_RAW_URL}`,
    );
    expect(header).toContain("// @run-at       document-end");
    expect(header).toContain("// @tag          parkrun");
    expect(header).toContain("// @tag          ambassy");
    expect(header).toContain("// @author       Pete Johns (@johnsyweb)");
  });

  it("uses the canonical install URL outside local development", () => {
    expect(
      getFinishExportUserscriptInstallUrl("https://www.johnsy.com/ambassy/"),
    ).toBe(FINISH_EXPORT_USERSCRIPT_METADATA.downloadUrl);
  });

  it("uses the local userscript URL during development", () => {
    expect(getFinishExportUserscriptInstallUrl("http://localhost:8081/")).toBe(
      "http://localhost:8081/script/ambassy-finish-export.user.js",
    );
  });

  it("matches the deployed userscript metadata header", () => {
    const userscriptSource = fs.readFileSync(userscriptPath, "utf8");
    const matches = buildFinishExportUserscriptMatches(expectedCountryHosts);
    const expectedHeader = buildFinishExportUserscriptHeader(matches);
    const actualHeader = userscriptSource
      .replace(/\n\n\(function \(\) \{[\s\S]*$/, "")
      .trimEnd();

    expect(actualHeader).toBe(expectedHeader);
    expect(parseUserscriptHeaderValue(userscriptSource, "version")).toBe(
      FINISH_EXPORT_USERSCRIPT_METADATA.version,
    );
    expect(parseUserscriptHeaderValue(userscriptSource, "updateURL")).toBe(
      FINISH_EXPORT_USERSCRIPT_METADATA.updateUrl,
    );
    expect(parseUserscriptHeaderValues(userscriptSource, "grant")).toEqual([
      ...FINISH_EXPORT_USERSCRIPT_METADATA.grants,
    ]);
    expect(parseUserscriptMatchLines(userscriptSource)).toEqual(matches);
  });
});
