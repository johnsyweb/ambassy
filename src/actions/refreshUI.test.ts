jest.mock("@actions/populateChangesLogTable", () => ({
  populateChangesLogTable: jest.fn(),
}));
jest.mock("@actions/populateEventTeamsTable", () => ({
  populateEventTeamsTable: jest.fn(),
}));
jest.mock("@actions/populateMap", () => ({
  populateMap: jest.fn(),
  applyAmbassadorNameFilterToMap: jest.fn(),
}));
jest.mock("@actions/populateAmbassadorsTable", () => ({
  populateAmbassadorsTable: jest.fn(),
}));
jest.mock("@actions/populateProspectsTable", () => ({
  populateProspectsTable: jest.fn(),
}));
jest.mock("@actions/persistProspectiveEvents", () => ({
  loadProspectiveEvents: jest.fn(() => []),
}));
jest.mock("@utils/storage", () => ({
  loadFromStorage: jest.fn(),
}));
jest.mock("@models/country", () => ({
  getCountriesSync: jest.fn(() => new Map()),
}));
jest.mock("./enrichEventTeamsWithLastAmbassadorVisit", () => ({
  enrichEventTeamsWithLastAmbassadorVisit: jest.fn(),
}));
jest.mock("./persistAmbassadorFinishHistory", () => ({
  loadAmbassadorFinishHistories: jest.fn(() => new Map()),
}));
jest.mock("./ambassadorNameFilterUI", () => ({
  updateAmbassadorNameFilterStatus: jest.fn(),
}));
jest.mock("@utils/ambassadorNameFilter", () => ({
  applyAmbassadorNameFilterToTables: jest.fn(),
}));

import { populateChangesLogTable } from "@actions/populateChangesLogTable";
import { populateEventTeamsTable } from "@actions/populateEventTeamsTable";
import {
  populateMap,
  applyAmbassadorNameFilterToMap,
} from "@actions/populateMap";
import { populateAmbassadorsTable } from "@actions/populateAmbassadorsTable";
import { populateProspectsTable } from "@actions/populateProspectsTable";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { refreshUI, REFRESH_ALL, REFRESH_TABLES_ONLY } from "./refreshUI";

describe("refreshUI", () => {
  const eventDetails = new Map() as EventDetailsMap;
  const eventTeamsTableData = new Map() as EventTeamsTableDataMap;
  const log: never[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rebuilds tables and map by default", () => {
    refreshUI(eventDetails, eventTeamsTableData, log);

    expect(populateEventTeamsTable).toHaveBeenCalled();
    expect(populateAmbassadorsTable).toHaveBeenCalled();
    expect(populateProspectsTable).toHaveBeenCalled();
    expect(populateChangesLogTable).toHaveBeenCalled();
    expect(populateMap).toHaveBeenCalled();
    expect(applyAmbassadorNameFilterToMap).toHaveBeenCalled();
  });

  it("rebuilds tables and map when REFRESH_ALL is passed explicitly", () => {
    refreshUI(
      eventDetails,
      eventTeamsTableData,
      log,
      undefined,
      undefined,
      REFRESH_ALL,
    );

    expect(populateEventTeamsTable).toHaveBeenCalled();
    expect(populateMap).toHaveBeenCalled();
  });

  it("skips map rebuild for metadata and log-only updates", () => {
    refreshUI(
      eventDetails,
      eventTeamsTableData,
      log,
      undefined,
      undefined,
      REFRESH_TABLES_ONLY,
    );

    expect(populateEventTeamsTable).toHaveBeenCalled();
    expect(populateAmbassadorsTable).toHaveBeenCalled();
    expect(populateProspectsTable).toHaveBeenCalled();
    expect(populateChangesLogTable).toHaveBeenCalled();
    expect(populateMap).not.toHaveBeenCalled();
    expect(applyAmbassadorNameFilterToMap).not.toHaveBeenCalled();
  });
});
