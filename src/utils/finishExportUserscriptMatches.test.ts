import fs from "fs";
import path from "path";
import {
  buildFinishExportUserscriptMatches,
  buildParkrunnerProfileMatch,
  extractCountryHostsFromEventsCountries,
  FINISH_EXPORT_AMBASSY_ORIGIN_MATCHES,
  parseUserscriptMatchLines,
} from "./finishExportUserscriptMatches";

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

describe("finishExportUserscriptMatches", () => {
  it("builds profile matches on the parkrunner /all path", () => {
    expect(buildParkrunnerProfileMatch("www.parkrun.com.au")).toBe(
      "*://www.parkrun.com.au/parkrunner/*/all*",
    );
    expect(buildParkrunnerProfileMatch("www.parkrun.org.uk")).toBe(
      "*://www.parkrun.org.uk/parkrunner/*/all*",
    );
  });

  it("extracts country hosts from events.json countries", () => {
    const hosts = extractCountryHostsFromEventsCountries({
      "3": { url: "www.parkrun.com.au" },
      "4": { url: "www.parkrun.org.uk" },
      "0": { url: null },
    });

    expect(hosts).toEqual(["www.parkrun.com.au", "www.parkrun.org.uk"]);
  });

  it("includes all current parkrun country hosts from the fixture", () => {
    expect(expectedCountryHosts).toEqual([
      "www.parkrun.ca",
      "www.parkrun.co.at",
      "www.parkrun.co.nl",
      "www.parkrun.co.nz",
      "www.parkrun.co.za",
      "www.parkrun.com.au",
      "www.parkrun.com.de",
      "www.parkrun.dk",
      "www.parkrun.fi",
      "www.parkrun.ie",
      "www.parkrun.it",
      "www.parkrun.jp",
      "www.parkrun.lt",
      "www.parkrun.my",
      "www.parkrun.no",
      "www.parkrun.org.uk",
      "www.parkrun.pl",
      "www.parkrun.se",
      "www.parkrun.sg",
      "www.parkrun.us",
    ]);
  });

  it("matches the deployed userscript header", () => {
    const userscriptSource = fs.readFileSync(userscriptPath, "utf8");
    const actualMatches = parseUserscriptMatchLines(userscriptSource);
    const expectedMatches =
      buildFinishExportUserscriptMatches(expectedCountryHosts);

    expect(actualMatches).toEqual(expectedMatches);
  });

  it("includes the Ambassy production origin match", () => {
    expect(FINISH_EXPORT_AMBASSY_ORIGIN_MATCHES).toContain(
      "https://johnsy.com/ambassy*",
    );
  });

  it("does not use the obsolete extra path segment before parkrunner", () => {
    const userscriptSource = fs.readFileSync(userscriptPath, "utf8");

    expect(userscriptSource).not.toMatch(/\/\*\/parkrunner\//);
  });
});
