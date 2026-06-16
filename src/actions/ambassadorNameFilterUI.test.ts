import {
  formatAmbassadorNameFilterStatus,
  getAmbassadorNameFilter,
  setAmbassadorNameFilter,
} from "@utils/ambassadorNameFilter";
import {
  initializeAmbassadorNameFilter,
  updateAmbassadorNameFilterStatus,
} from "./ambassadorNameFilterUI";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { ProspectiveEventList } from "@models/ProspectiveEventList";

jest.mock("./populateMap", () => ({
  applyAmbassadorNameFilterToMap: jest.fn(),
}));

describe("ambassadorNameFilterUI", () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.body.innerHTML = `
      <div id="ambassadorNameFilterBar">
        <label for="ambassadorNameFilterInput">Ambassador name filter</label>
        <input type="search" id="ambassadorNameFilterInput" />
        <button type="button" id="ambassadorNameFilterClear">Clear</button>
        <span id="ambassadorNameFilterStatus"></span>
      </div>
      <div id="tabsContainer">
        <div class="tabs" role="tablist">
          <button class="tab-button active" role="tab" aria-selected="true">Event Teams</button>
          <button class="tab-button" role="tab" aria-selected="false">Event Ambassadors</button>
        </div>
      </div>
    `;
  });

  it("restores the filter from session storage and applies views when the user types", () => {
    jest.useFakeTimers();
    sessionStorage.setItem("ambassy:ambassadorNameFilter", "pete");
    const context = {
      eventTeamsTableData: new Map(),
      eventAmbassadors: new Map(),
      regionalAmbassadors: new Map(),
      prospects: new ProspectiveEventList([]),
    };

    initializeAmbassadorNameFilter(() => context);

    const input = document.getElementById(
      "ambassadorNameFilterInput",
    ) as HTMLInputElement;
    expect(input.value).toBe("pete");

    input.value = "kim";
    input.dispatchEvent(new Event("input"));

    expect(getAmbassadorNameFilter()).toBe("kim");

    jest.runAllTimers();
    jest.useRealTimers();
  });

  it("clears the filter when Clear is clicked", () => {
    setAmbassadorNameFilter("pete");
    initializeAmbassadorNameFilter(() => ({
      eventTeamsTableData: new Map(),
      eventAmbassadors: new Map(),
      regionalAmbassadors: new Map(),
      prospects: new ProspectiveEventList([]),
    }));

    const clearButton = document.getElementById(
      "ambassadorNameFilterClear",
    ) as HTMLButtonElement;
    clearButton.click();

    expect(getAmbassadorNameFilter()).toBe("");
    expect(
      (document.getElementById("ambassadorNameFilterInput") as HTMLInputElement)
        .value,
    ).toBe("");
  });

  it("shows a live row count for the active tab", () => {
    const eventTeamsTableData: EventTeamsTableDataMap = new Map([
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

    setAmbassadorNameFilter("pete");
    updateAmbassadorNameFilterStatus({
      eventTeamsTableData,
      eventAmbassadors: new Map(),
      regionalAmbassadors: new Map(),
      prospects: new ProspectiveEventList([]),
    });

    const status = document.getElementById("ambassadorNameFilterStatus");
    expect(status?.textContent).toBe(
      formatAmbassadorNameFilterStatus("Event Teams", 1, 2, "pete"),
    );
  });
});
