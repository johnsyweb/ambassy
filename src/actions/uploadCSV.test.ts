import { handleFileUpload } from "./uploadCSV";
import { persistEventAmbassadors, persistEventTeams, persistRegionalAmbassadors } from "./persistState";

jest.mock("./persistState");

describe("handleFileUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
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
      expect(persistEventTeams).toHaveBeenCalled();
      done();
    });
  });

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

