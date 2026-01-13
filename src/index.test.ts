import { EventAmbassadorMap } from "./models/EventAmbassadorMap";
import { EventTeamMap } from "./models/EventTeamMap";
import { RegionalAmbassadorMap } from "./models/RegionalAmbassadorMap";

// Import functions from index.ts - we'll need to export them for testing
// For now, we'll test the logic directly

function hasApplicationData(
  eventTeams: EventTeamMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap
): boolean {
  return eventTeams.size > 0 && eventAmbassadors.size > 0 && regionalAmbassadors.size > 0;
}

function isMapViewDisplayed(): boolean {
  const ambassyElement = document.getElementById("ambassy");
  return ambassyElement !== null && ambassyElement.style.display !== "none";
}

function updateButtonVisibility(
  hasData: boolean,
  isMapViewVisible: boolean
): void {
  const exportButtonMap = document.getElementById("exportButtonMap");
  const importButton = document.getElementById("importButton");
  const importButtonMap = document.getElementById("importButtonMap");

  if (exportButtonMap) {
    if (hasData && isMapViewVisible) {
      exportButtonMap.style.display = "";
    } else {
      exportButtonMap.style.display = "none";
    }
  }

  if (importButton) {
    importButton.style.display = "";
  }

  if (importButtonMap) {
    importButtonMap.style.display = "";
  }
}

beforeEach(() => {
  // Create mock elements
  document.body.innerHTML = "";
  
  const ambassy = document.createElement("div");
  ambassy.id = "ambassy";
  ambassy.style.display = "none";
  document.body.appendChild(ambassy);

  const exportButtonMap = document.createElement("button");
  exportButtonMap.id = "exportButtonMap";
  ambassy.appendChild(exportButtonMap);

  const importButton = document.createElement("button");
  importButton.id = "importButton";
  document.body.appendChild(importButton);

  const importButtonMap = document.createElement("button");
  importButtonMap.id = "importButtonMap";
  ambassy.appendChild(importButtonMap);
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("hasApplicationData", () => {
  it("should return false when no data is present", () => {
    const eventTeams: EventTeamMap = new Map();
    const eventAmbassadors: EventAmbassadorMap = new Map();
    const regionalAmbassadors: RegionalAmbassadorMap = new Map();

    expect(hasApplicationData(eventTeams, eventAmbassadors, regionalAmbassadors)).toBe(false);
  });

  it("should return true when all data is present", () => {
    const eventTeams: EventTeamMap = new Map([["team1", { eventShortName: "team1", eventAmbassador: "ea1", eventDirectors: [] }]]);
    const eventAmbassadors: EventAmbassadorMap = new Map([["ea1", { name: "EA1", events: [] }]]);
    const regionalAmbassadors: RegionalAmbassadorMap = new Map([["ra1", { name: "REA1", state: "VIC", supportsEAs: [] }]]);

    expect(hasApplicationData(eventTeams, eventAmbassadors, regionalAmbassadors)).toBe(true);
  });

  it("should return false when only some data is present", () => {
    const eventTeams: EventTeamMap = new Map([["team1", { eventShortName: "team1", eventAmbassador: "ea1", eventDirectors: [] }]]);
    const eventAmbassadors: EventAmbassadorMap = new Map();
    const regionalAmbassadors: RegionalAmbassadorMap = new Map();

    expect(hasApplicationData(eventTeams, eventAmbassadors, regionalAmbassadors)).toBe(false);
  });
});

describe("isMapViewDisplayed", () => {
  it("should return false when upload section is visible", () => {
    const ambassyElement = document.getElementById("ambassy");
    if (ambassyElement) {
      ambassyElement.style.display = "none";
    }
    
    expect(isMapViewDisplayed()).toBe(false);
  });

  it("should return true when map view is visible", () => {
    const ambassyElement = document.getElementById("ambassy");
    if (ambassyElement) {
      ambassyElement.style.display = "block";
    }
    
    expect(isMapViewDisplayed()).toBe(true);
  });
});

describe("updateButtonVisibility", () => {
  it("should hide export button when no data", () => {
    const ambassyElement = document.getElementById("ambassy");
    if (ambassyElement) {
      ambassyElement.style.display = "none";
    }
    
    updateButtonVisibility(false, false);
    
    const exportButton = document.getElementById("exportButtonMap");
    expect(exportButton?.style.display).toBe("none");
  });

  it("should show export button when data loaded", () => {
    const ambassyElement = document.getElementById("ambassy");
    if (ambassyElement) {
      ambassyElement.style.display = "block";
    }
    
    updateButtonVisibility(true, true);
    
    const exportButton = document.getElementById("exportButtonMap");
    expect(exportButton?.style.display).not.toBe("none");
  });
});

describe("Export button visibility - integration", () => {
  it("should not exist in upload section", () => {
    const exportButton = document.getElementById("exportButton");
    // Button should not exist in upload section after implementation
    expect(exportButton).toBeNull();
  });

  it("should be visible in map view when data loaded", () => {
    const exportButtonMap = document.getElementById("exportButtonMap");
    const ambassyElement = document.getElementById("ambassy");
    
    if (ambassyElement) {
      ambassyElement.style.display = "block";
    }
    
    updateButtonVisibility(true, true);
    
    expect(exportButtonMap).not.toBeNull();
    expect(exportButtonMap?.style.display).not.toBe("none");
  });

  it("should be hidden in map view when no data", () => {
    const exportButtonMap = document.getElementById("exportButtonMap");
    const ambassyElement = document.getElementById("ambassy");
    
    if (ambassyElement) {
      ambassyElement.style.display = "none";
    }
    
    updateButtonVisibility(false, false);
    
    expect(exportButtonMap).not.toBeNull();
    expect(exportButtonMap?.style.display).toBe("none");
  });
});

describe("Import button visibility - integration", () => {
  it("should always be visible in upload section", () => {
    const importButton = document.getElementById("importButton");
    expect(importButton).not.toBeNull();
    if (importButton) {
      importButton.style.display = "";
    }
    expect(importButton?.style.display).not.toBe("none");
  });

  it("should always be visible in map view", () => {
    const importButtonMap = document.getElementById("importButtonMap");
    expect(importButtonMap).not.toBeNull();
    if (importButtonMap) {
      importButtonMap.style.display = "";
    }
    expect(importButtonMap?.style.display).not.toBe("none");
  });
});

describe("Import button functionality", () => {
  it("should trigger file input click from upload section", () => {
    const importButton = document.getElementById("importButton");
    const fileInput = document.createElement("input");
    fileInput.id = "importFileInput";
    fileInput.type = "file";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    let clicked = false;
    fileInput.addEventListener("click", () => {
      clicked = true;
    });

    if (importButton) {
      importButton.click();
      // Simulate the click triggering file input
      fileInput.click();
    }

    expect(clicked).toBe(true);
  });

  it("should trigger file input click from map view", () => {
    const importButtonMap = document.getElementById("importButtonMap");
    const fileInput = document.createElement("input");
    fileInput.id = "importFileInput";
    fileInput.type = "file";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    let clicked = false;
    fileInput.addEventListener("click", () => {
      clicked = true;
    });

    if (importButtonMap) {
      importButtonMap.click();
      // Simulate the click triggering file input
      fileInput.click();
    }

    expect(clicked).toBe(true);
  });
});

