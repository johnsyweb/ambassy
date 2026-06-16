import { EventTeamsTableData } from "@models/EventTeamsTableData";
import {
  ambassadorNameFieldMatches,
  applyAmbassadorNameFilterToTables,
  buildAmbassadorFilterText,
  clearAmbassadorNameFilter,
  countEventTeamsMatchingFilter,
  eventAmbassadorRowMatchesAmbassadorNameFilter,
  eventTeamRowMatchesAmbassadorNameFilter,
  formatAmbassadorNameFilterStatus,
  getAmbassadorNameFilter,
  prospectRowMatchesAmbassadorNameFilter,
  regionalAmbassadorRowMatchesAmbassadorNameFilter,
  setAmbassadorNameFilter,
} from "./ambassadorNameFilter";

describe("ambassadorNameFilter", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("treats an empty filter as matching every ambassador name field", () => {
    expect(ambassadorNameFieldMatches("Pete Robinson", "")).toBe(true);
    expect(ambassadorNameFieldMatches("Pete Robinson", "   ")).toBe(true);
  });

  it("matches ambassador names case-insensitively by substring", () => {
    expect(ambassadorNameFieldMatches("Pete Robinson", "pete")).toBe(true);
    expect(ambassadorNameFieldMatches("Kim De Waal", "pete")).toBe(false);
  });

  it("matches Event Teams rows on REA or EA columns", () => {
    const row: EventTeamsTableData = {
      eventShortName: "South Bank",
      eventDirectors: "ED",
      eventAmbassador: "Pete Robinson",
      regionalAmbassador: "Kim De Waal",
      eventCoordinates: "0,0",
      eventSeries: 1,
      eventCountryCode: 3,
      eventCountry: "AU",
    };

    expect(eventTeamRowMatchesAmbassadorNameFilter(row, "kim")).toBe(true);
    expect(eventTeamRowMatchesAmbassadorNameFilter(row, "pete")).toBe(true);
    expect(eventTeamRowMatchesAmbassadorNameFilter(row, "south")).toBe(false);
  });

  it("matches Event Ambassador rows on EA name or supporting REA", () => {
    expect(
      eventAmbassadorRowMatchesAmbassadorNameFilter(
        "Pete Robinson",
        "Kim De Waal",
        "kim",
      ),
    ).toBe(true);
    expect(
      eventAmbassadorRowMatchesAmbassadorNameFilter(
        "Pete Robinson",
        "Kim De Waal",
        "pete",
      ),
    ).toBe(true);
    expect(
      eventAmbassadorRowMatchesAmbassadorNameFilter(
        "Pete Robinson",
        "Kim De Waal",
        "chris",
      ),
    ).toBe(false);
  });

  it("matches Regional Ambassador rows on REA name or supported EAs", () => {
    expect(
      regionalAmbassadorRowMatchesAmbassadorNameFilter(
        "Kim De Waal",
        ["Pete Robinson", "Chris Example"],
        "pete",
      ),
    ).toBe(true);
    expect(
      regionalAmbassadorRowMatchesAmbassadorNameFilter(
        "Kim De Waal",
        ["Pete Robinson"],
        "kim",
      ),
    ).toBe(true);
    expect(
      regionalAmbassadorRowMatchesAmbassadorNameFilter(
        "Kim De Waal",
        ["Pete Robinson"],
        "chris",
      ),
    ).toBe(false);
  });

  it("matches prospect rows on assigned EA only", () => {
    expect(
      prospectRowMatchesAmbassadorNameFilter("Pete Robinson", "pete"),
    ).toBe(true);
    expect(prospectRowMatchesAmbassadorNameFilter("Pete Robinson", "kim")).toBe(
      false,
    );
    expect(prospectRowMatchesAmbassadorNameFilter(undefined, "pete")).toBe(
      false,
    );
  });

  it("builds lowercase filter text from ambassador fields", () => {
    expect(buildAmbassadorFilterText("Kim De Waal", "Pete Robinson")).toBe(
      "kim de waal pete robinson",
    );
  });

  it("hides non-matching table rows without rebuilding them", () => {
    document.body.innerHTML = `
      <table id="eventTeamsTable">
        <tbody>
          <tr data-ambassador-filter-text="pete robinson kim de waal"></tr>
          <tr data-ambassador-filter-text="chris example kim de waal"></tr>
        </tbody>
      </table>
    `;

    setAmbassadorNameFilter("pete");
    applyAmbassadorNameFilterToTables();

    const rows = document.querySelectorAll<HTMLTableRowElement>(
      "#eventTeamsTable tbody tr",
    );
    expect(rows[0].hidden).toBe(false);
    expect(rows[1].hidden).toBe(true);
  });

  it("persists the filter in session storage across reload", () => {
    setAmbassadorNameFilter("pete");
    expect(getAmbassadorNameFilter()).toBe("pete");
    clearAmbassadorNameFilter();
    expect(getAmbassadorNameFilter()).toBe("");
  });

  it("formats the status line for filtered and unfiltered views", () => {
    expect(formatAmbassadorNameFilterStatus("Event Teams", 5, 5, "")).toBe(
      "5 event teams rows",
    );
    expect(formatAmbassadorNameFilterStatus("Event Teams", 2, 5, "pete")).toBe(
      "Showing 2 of 5 event teams rows",
    );
  });

  it("counts visible Event Teams rows for the status line", () => {
    const rows = new Map<string, EventTeamsTableData>([
      [
        "A",
        {
          eventShortName: "A",
          eventDirectors: "",
          eventAmbassador: "Pete Robinson",
          regionalAmbassador: "Kim De Waal",
          eventCoordinates: "",
          eventSeries: 1,
          eventCountryCode: 3,
          eventCountry: "AU",
        },
      ],
      [
        "B",
        {
          eventShortName: "B",
          eventDirectors: "",
          eventAmbassador: "Chris Example",
          regionalAmbassador: "Kim De Waal",
          eventCoordinates: "",
          eventSeries: 1,
          eventCountryCode: 3,
          eventCountry: "AU",
        },
      ],
    ]);

    expect(countEventTeamsMatchingFilter(rows, "pete")).toEqual({
      visible: 1,
      total: 2,
    });
  });
});
