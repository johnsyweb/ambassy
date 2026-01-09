import { handleFileUpload } from "./uploadCSV";
import { persistEventAmbassadors, persistEventTeams, persistRegionalAmbassadors } from "./persistState";
import { parseEventTeams } from "@parsers/parseEventTeams";
import { parseEventAmbassadors } from "@parsers/parseEventAmbassadors";
import { parseRegionalAmbassadors } from "@parsers/parseRegionalAmbassadors";

jest.mock("./persistState");
jest.mock("@parsers/parseEventTeams");
jest.mock("@parsers/parseEventAmbassadors");
jest.mock("@parsers/parseRegionalAmbassadors");

// Mock Papa.parse to call complete callback synchronously
jest.mock("papaparse", () => ({
  __esModule: true,
  default: {
    parse: jest.fn((file: File, options: { complete?: (result: { data: unknown[] }) => void }) => {
      if (options.complete) {
        const csvContent = file.name.includes("Event Teams")
          ? [{ "Event Short Name": "Event1", "Event Ambassador": "EA1", "Event Director(s)": "ED1" }]
          : file.name.includes("Event Ambassadors")
          ? [{ Name: "Test EA", Events: "Event1" }]
          : [{ Name: "Test REA", State: "VIC", "Supports EAs": "EA1" }];
        options.complete({ data: csvContent });
      }
    }),
  },
}));

describe("handleFileUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    (parseEventTeams as jest.Mock).mockReturnValue(new Map());
    (parseEventAmbassadors as jest.Mock).mockReturnValue(new Map());
    (parseRegionalAmbassadors as jest.Mock).mockReturnValue(new Map());
  });

  it("should persist Event Ambassadors after parsing CSV", (done) => {
    const csvContent = "Name,Events\nTest EA,Event1";
    const file = new File([csvContent], "Ambassadors - Event Ambassadors.csv", {
      type: "text/csv",
    });

    handleFileUpload(file, () => {
      expect(persistEventAmbassadors).toHaveBeenCalled();
      done();
    });
  });

  it("should persist Event Teams after parsing CSV", (done) => {
    const csvContent = "Event Short Name,Event Ambassador,Event Director(s)\nEvent1,EA1,ED1";
    const file = new File([csvContent], "Ambassadors - Event Teams.csv", {
      type: "text/csv",
    });

    handleFileUpload(file, () => {
      try {
        expect(persistEventTeams).toHaveBeenCalled();
        done();
      } catch (error) {
        done(error);
      }
    });
  }, 10000);

  it("should persist Regional Ambassadors after parsing CSV", (done) => {
    const csvContent = "Name,State,Supports EAs\nTest REA,VIC,EA1";
    const file = new File([csvContent], "Ambassadors - Regional Ambassadors.csv", {
      type: "text/csv",
    });

    handleFileUpload(file, () => {
      expect(persistRegionalAmbassadors).toHaveBeenCalled();
      done();
    });
  });
});

