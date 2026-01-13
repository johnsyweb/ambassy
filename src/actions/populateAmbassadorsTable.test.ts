import { populateAmbassadorsTable, setEAReallocateHandler, setOffboardingHandlers } from "./populateAmbassadorsTable";
import { EventAmbassadorMap } from "../models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";

describe("populateAmbassadorsTable", () => {
  let eventAmbassadors: EventAmbassadorMap;
  let regionalAmbassadors: RegionalAmbassadorMap;
  let tableBody: HTMLTableSectionElement;

  beforeEach(() => {
    // Create table structure
    document.body.innerHTML = `
      <table id="eventAmbassadorsTable">
        <thead>
          <tr>
            <th>Name</th>
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
      ["EA 1", { name: "EA 1", events: ["Event1", "Event2"] }],
      ["EA 2", { name: "EA 2", events: ["Event3"] }],
    ]);

    regionalAmbassadors = new Map([
      ["REA 1", { name: "REA 1", state: "VIC", supportsEAs: ["EA 1"] }],
    ]);

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

  it("should have Name column with only name and color indicator", () => {
    populateAmbassadorsTable(eventAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    const firstRow = rows[0];
    const nameCell = firstRow.querySelector("td:first-child") as HTMLTableCellElement;

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
    const emptyAmbassadors = new Map<string, any>();
    populateAmbassadorsTable(emptyAmbassadors, regionalAmbassadors);

    const rows = tableBody.querySelectorAll("tr");
    expect(rows.length).toBe(0);
  });
});
