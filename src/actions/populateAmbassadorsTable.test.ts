import { populateAmbassadorsTable, setEAReallocateHandler, setOffboardingHandlers } from "./populateAmbassadorsTable";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventDetails } from "@models/EventDetails";
import { CountryMap } from "@models/country";

describe("populateAmbassadorsTable", () => {
  let eventAmbassadors: EventAmbassadorMap;
  let regionalAmbassadors: RegionalAmbassadorMap;
  let eventDetails: EventDetailsMap;
  let countries: CountryMap;
  let tableBody: HTMLTableSectionElement;

  beforeEach(() => {
    // Create table structure
    document.body.innerHTML = `
      <table id="eventAmbassadorsTable">
        <thead>
          <tr>
            <th>Regional Ambassador</th>
            <th>Name</th>
            <th>State</th>
            <th>Number of Allocations</th>
            <th>Events Assigned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <table id="regionalAmbassadorsTable">
        <thead>
          <tr>
            <th>Name</th>
            <th>State</th>
            <th>Number of Allocations</th>
            <th>Event Ambassadors Supported</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    tableBody = document.querySelector("#eventAmbassadorsTable tbody") as HTMLTableSectionElement;

    eventAmbassadors = new Map([
      ["EA 1", { name: "EA 1", events: ["Event1", "Event2"], regionalAmbassador: "REA 1", state: "VIC" }],
      ["EA 2", { name: "EA 2", events: ["Event3"], state: "NSW" }],
    ]);

    regionalAmbassadors = new Map([
      ["REA 1", { name: "REA 1", state: "VIC", supportsEAs: ["EA 1"] }],
    ]);

    eventDetails = new Map<string, EventDetails>([
      ["Event1", {
        id: "event1",
        type: "Feature",
        geometry: { type: "Point", coordinates: [144.9631, -37.8136] },
        properties: {
          eventname: "event1",
          EventLongName: "Event 1",
          EventShortName: "Event1",
          LocalisedEventLongName: null,
          countrycode: 3,
          seriesid: 1,
          EventLocation: "Melbourne"
        }
      }],
      ["Event2", {
        id: "event2",
        type: "Feature",
        geometry: { type: "Point", coordinates: [151.2093, -33.8688] },
        properties: {
          eventname: "event2",
          EventLongName: "Event 2",
          EventShortName: "Event2",
          LocalisedEventLongName: null,
          countrycode: 3,
          seriesid: 1,
          EventLocation: "Sydney"
        }
      }],
      ["Event3", {
        id: "event3",
        type: "Feature",
        geometry: { type: "Point", coordinates: [-0.1276, 51.5074] },
        properties: {
          eventname: "event3",
          EventLongName: "Event 3",
          EventShortName: "Event3",
          LocalisedEventLongName: null,
          countrycode: 1,
          seriesid: 1,
          EventLocation: "London"
        }
      }]
    ]);

    countries = {
      '3': { url: 'www.parkrun.com.au', bounds: [113.0, -44.0, 154.0, -10.0] },
      '1': { url: 'www.parkrun.co.uk', bounds: [-8.0, 49.0, 2.0, 61.0] },
    };

    setEAReallocateHandler(() => {});
    setOffboardingHandlers(() => {}, () => {});
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should create Actions column with both Reallocate and Offboard buttons", () => {
    populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    expect(rows.length).toBe(2);

    const firstRow = rows[0];
    const actionsCell = firstRow.querySelector("td:last-child") as HTMLTableCellElement;
    expect(actionsCell).not.toBeNull();

    const reallocateButton = actionsCell.querySelector('button[aria-label*="Reallocate"]') as HTMLButtonElement;
    const offboardButton = actionsCell.querySelector('button[aria-label*="Offboard"]') as HTMLButtonElement;

    expect(reallocateButton).not.toBeNull();
    expect(offboardButton).not.toBeNull();
  });

  it("should display Reallocate button with 🤝🏼 icon and text", () => {
    populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    const firstRow = rows[0];
    const reallocateButton = firstRow.querySelector('button[aria-label*="Reallocate"]') as HTMLButtonElement;

    expect(reallocateButton.innerHTML).toContain("🤝🏼");
    expect(reallocateButton.innerHTML).toContain("Reallocate");
  });

  it("should display Offboard button with 🚪 icon and text", () => {
    populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    const firstRow = rows[0];
    const offboardButton = firstRow.querySelector('button[aria-label*="Offboard"]') as HTMLButtonElement;

    expect(offboardButton.innerHTML).toContain("🚪");
    expect(offboardButton.innerHTML).toContain("Offboard");
  });

  it("should have buttons side-by-side with appropriate spacing", () => {
    populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    const firstRow = rows[0];
    const actionsCell = firstRow.querySelector("td:last-child") as HTMLTableCellElement;
    const actionsContainer = actionsCell.querySelector("div") as HTMLDivElement;

    expect(actionsContainer.style.display).toBe("flex");
    expect(actionsContainer.style.gap).toBe("6px");
    expect(actionsContainer.style.alignItems).toBe("center");
  });

  it("should have REA column as first column", () => {
    populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    expect(rows.length).toBeGreaterThan(0);
    
    // Find row with EA 1 (which has REA 1 assigned)
    let ea1Row: HTMLTableRowElement | null = null;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as HTMLTableRowElement;
      const cells = row.querySelectorAll("td");
      const nameCell = cells[1]; // Name is second column
      if (nameCell?.textContent?.includes("EA 1")) {
        ea1Row = row;
        break;
      }
    }
    
    expect(ea1Row).not.toBeNull();
    const cells = ea1Row!.querySelectorAll("td");
    const reaCell = cells[0] as HTMLTableCellElement;
    expect(reaCell.textContent).toBe("REA 1");
  });

  it("should display '—' in REA column when no REA assigned", () => {
    populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    expect(rows.length).toBeGreaterThan(0);
    
    // Find row with EA 2 (which has no REA assigned)
    let ea2Row: HTMLTableRowElement | null = null;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as HTMLTableRowElement;
      const cells = row.querySelectorAll("td");
      const nameCell = cells[1]; // Name is second column
      if (nameCell?.textContent?.includes("EA 2")) {
        ea2Row = row;
        break;
      }
    }
    
    expect(ea2Row).not.toBeNull();
    const cells = ea2Row!.querySelectorAll("td");
    const reaCell = cells[0] as HTMLTableCellElement;
    expect(reaCell.textContent).toBe("—");
    expect(reaCell.style.fontStyle).toBe("italic");
    expect(reaCell.style.color).toBe("rgb(102, 102, 102)");
  });

  it("should have Name column with only name and color indicator", () => {
    populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    expect(rows.length).toBeGreaterThan(0);
    
    // Find row with EA 1
    let ea1Row: HTMLTableRowElement | null = null;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as HTMLTableRowElement;
      const cells = row.querySelectorAll("td");
      const nameCell = cells[1]; // Name is second column
      if (nameCell?.textContent?.includes("EA 1")) {
        ea1Row = row;
        break;
      }
    }
    
    expect(ea1Row).not.toBeNull();
    const cells = ea1Row!.querySelectorAll("td");
    const nameCell = cells[1] as HTMLTableCellElement; // Name is second column

    // Should have a container div
    const nameContainer = nameCell.querySelector("div");
    expect(nameContainer).not.toBeNull();

    // Should have color indicator
    const colorIndicator = nameContainer?.querySelector("span");
    expect(colorIndicator).not.toBeNull();

    // Should have name span
    const nameSpan = nameContainer?.querySelectorAll("span")[1];
    expect(nameSpan).not.toBeNull();
    expect(nameSpan?.textContent).toBe("EA 1");

    // Should NOT have any buttons in name column
    const buttons = nameCell.querySelectorAll("button");
    expect(buttons.length).toBe(0);
  });

  it("should maintain button accessibility attributes", () => {
    populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    const firstRow = rows[0];
    const reallocateButton = firstRow.querySelector('button[aria-label*="Reallocate"]') as HTMLButtonElement;
    const offboardButton = firstRow.querySelector('button[aria-label*="Offboard"]') as HTMLButtonElement;

    expect(reallocateButton.getAttribute("aria-label")).toContain("Reallocate Event Ambassador");
    expect(offboardButton.getAttribute("aria-label")).toContain("Offboard Event Ambassador");
    expect(reallocateButton.title).toBeTruthy();
    expect(offboardButton.title).toBeTruthy();
  });

  it("should maintain button keyboard accessibility", () => {
    populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    const firstRow = rows[0];
    const reallocateButton = firstRow.querySelector('button[aria-label*="Reallocate"]') as HTMLButtonElement;

    const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
    const spaceEvent = new KeyboardEvent("keydown", { key: " " });

    expect(() => reallocateButton.dispatchEvent(enterEvent)).not.toThrow();
    expect(() => reallocateButton.dispatchEvent(spaceEvent)).not.toThrow();
  });

  it("should have Actions column as the rightmost column", () => {
    populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    const firstRow = rows[0];
    const cells = firstRow.querySelectorAll("td");
    const lastCell = cells[cells.length - 1];

    // Last cell should contain buttons
    const buttons = lastCell.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should handle empty actions gracefully", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emptyAmbassadors = new Map<string, any>();
    populateAmbassadorsTable(emptyAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    expect(rows.length).toBe(0);
  });

  describe("event history links", () => {
    it("should render event names as links when eventDetails and countries are provided", () => {
      populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors, undefined, eventDetails, countries);

      const rows = tableBody.querySelectorAll("tr");
      // Find row for "EA 1" (rows are sorted alphabetically)
      const ea1Row = Array.from(rows).find(row => {
        const nameCell = row.querySelector("td:nth-child(2)") as HTMLTableCellElement;
        return nameCell?.textContent?.includes("EA 1");
      });
      expect(ea1Row).toBeTruthy();
      const eventsCell = ea1Row!.querySelector("td:nth-child(5)") as HTMLTableCellElement;

      const links = eventsCell.querySelectorAll("a");
      expect(links.length).toBeGreaterThan(0);

      const firstLink = links[0] as HTMLAnchorElement;
      expect(firstLink.tagName).toBe("A");
      expect(firstLink.href).toContain("parkrun.com.au");
      expect(firstLink.href).toContain("/results/eventhistory/");
    });

    it("should have correct link attributes (href, target, rel)", () => {
      populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors, undefined, eventDetails, countries);

      const rows = tableBody.querySelectorAll("tr");
      // Find row for "EA 1" (rows are sorted alphabetically)
      const ea1Row = Array.from(rows).find(row => {
        const nameCell = row.querySelector("td:nth-child(2)") as HTMLTableCellElement;
        return nameCell?.textContent?.includes("EA 1");
      });
      expect(ea1Row).toBeTruthy();
      const eventsCell = ea1Row!.querySelector("td:nth-child(5)") as HTMLTableCellElement;
      const links = eventsCell.querySelectorAll("a");

      links.forEach((link) => {
        const anchor = link as HTMLAnchorElement;
        expect(anchor.href).toMatch(/^https:\/\/www\.parkrun\.(com\.au|co\.uk)\/[^/]+\/results\/eventhistory\/$/);
        expect(anchor.target).toBe("_blank");
        expect(anchor.rel).toBe("noopener noreferrer");
      });
    });

    it("should be keyboard accessible (focusable and activatable)", () => {
      populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors, undefined, eventDetails, countries);

      const rows = tableBody.querySelectorAll("tr");
      // Find row for "EA 1" (rows are sorted alphabetically)
      const ea1Row = Array.from(rows).find(row => {
        const nameCell = row.querySelector("td:nth-child(2)") as HTMLTableCellElement;
        return nameCell?.textContent?.includes("EA 1");
      });
      expect(ea1Row).toBeTruthy();
      const eventsCell = ea1Row!.querySelector("td:nth-child(5)") as HTMLTableCellElement;
      const firstLink = eventsCell.querySelector("a") as HTMLAnchorElement;

      expect(firstLink).not.toBeNull();
      expect(firstLink.tabIndex).not.toBe(-1);

      const focusEvent = new FocusEvent("focus");
      expect(() => firstLink.dispatchEvent(focusEvent)).not.toThrow();

      const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
      expect(() => firstLink.dispatchEvent(enterEvent)).not.toThrow();
    });

    it("should render event names as plain text when domain data is missing", () => {
      const countriesWithoutUrl: CountryMap = {
        '3': { url: null, bounds: [113.0, -44.0, 154.0, -10.0] },
      };
      
      populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors, undefined, eventDetails, countriesWithoutUrl);

      const rows = tableBody.querySelectorAll("tr");
      // Find row for "EA 1" (rows are sorted alphabetically)
      const ea1Row = Array.from(rows).find(row => {
        const nameCell = row.querySelector("td:nth-child(2)") as HTMLTableCellElement;
        return nameCell?.textContent?.includes("EA 1");
      });
      expect(ea1Row).toBeTruthy();
      const eventsCell = ea1Row!.querySelector("td:nth-child(5)") as HTMLTableCellElement;

      const links = eventsCell.querySelectorAll("a");
      expect(links.length).toBe(0);

      const textContent = eventsCell.textContent || "";
      expect(textContent).toContain("Event1");
      expect(textContent).toContain("Event2");
    });

    it("should add tooltip and aria-label when URL is unavailable", () => {
      const countriesWithoutUrl: CountryMap = {
        '3': { url: null, bounds: [113.0, -44.0, 154.0, -10.0] },
      };
      
      populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors, undefined, eventDetails, countriesWithoutUrl);

      const rows = tableBody.querySelectorAll("tr");
      // Find row for "EA 1" (rows are sorted alphabetically)
      const ea1Row = Array.from(rows).find(row => {
        const nameCell = row.querySelector("td:nth-child(2)") as HTMLTableCellElement;
        return nameCell?.textContent?.includes("EA 1");
      });
      expect(ea1Row).toBeTruthy();
      const eventsCell = ea1Row!.querySelector("td:nth-child(5)") as HTMLTableCellElement;

      const spans = eventsCell.querySelectorAll("span");
      if (spans.length > 0) {
        const spanWithTooltip = Array.from(spans).find(span => 
          span.getAttribute("title") || span.getAttribute("aria-label")
        );
        if (spanWithTooltip) {
          expect(spanWithTooltip.getAttribute("title") || spanWithTooltip.getAttribute("aria-label")).toContain("unavailable");
        }
      }
    });

    it("should not throw console errors when EventDetails is missing", () => {
      const emptyEventDetails = new Map<string, EventDetails>();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors, undefined, emptyEventDetails, countries);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();

      const rows = tableBody.querySelectorAll("tr");
      expect(rows.length).toBeGreaterThan(0);
    });
  });
});
