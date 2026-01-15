import { populateIssuesTable } from "./populateIssuesTable";
import { EventIssue } from "@models/EventIssue";
import { IssuesState, createIssuesState } from "@models/IssuesState";

describe("populateIssuesTable", () => {
  let tableBody: HTMLTableSectionElement;
  let issuesState: IssuesState;
  let onIssueSelect: jest.Mock;
  let onResolve: jest.Mock;

  beforeEach(() => {
    document.body.innerHTML = `
      <table id="issuesTable">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Event Ambassador</th>
            <th>Regional Ambassador</th>
            <th>Issue Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;
    tableBody = document.querySelector("#issuesTable tbody")!;
    issuesState = createIssuesState();
    onIssueSelect = jest.fn();
    onResolve = jest.fn();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should display empty state when no issues", () => {
    populateIssuesTable(
      [],
      issuesState,
      onIssueSelect,
      onResolve
    );

    const row = tableBody.querySelector("tr");
    expect(row).not.toBeNull();
    const cell = row?.querySelector("td");
    expect(cell?.textContent).toContain("No issues found");
    expect(cell?.colSpan).toBe(5);
  });

  it("should create table rows for each unresolved issue", () => {
    const issues: EventIssue[] = [
      {
        eventShortName: "event1",
        eventAmbassador: "EA1",
        regionalAmbassador: "RA1",
        issueType: "missing_coordinates",
        status: "unresolved",
      },
      {
        eventShortName: "event2",
        eventAmbassador: "EA2",
        regionalAmbassador: "RA2",
        issueType: "missing_details",
        status: "unresolved",
      },
    ];

    populateIssuesTable(
      issues,
      issuesState,
      onIssueSelect,
      onResolve
    );

    const rows = tableBody.querySelectorAll("tr");
    expect(rows.length).toBe(2);
  });

  it("should display event name, ambassadors, and issue type", () => {
    const issues: EventIssue[] = [
      {
        eventShortName: "event1",
        eventAmbassador: "EA1",
        regionalAmbassador: "RA1",
        issueType: "missing_coordinates",
        status: "unresolved",
      },
    ];

    populateIssuesTable(
      issues,
      issuesState,
      onIssueSelect,
      onResolve
    );

    const row = tableBody.querySelector("tr");
    const cells = row?.querySelectorAll("td");
    expect(cells?.[0].textContent).toBe("event1");
    expect(cells?.[1].textContent).toBe("EA1");
    expect(cells?.[2].textContent).toBe("RA1");
    expect(cells?.[3].textContent).toBe("Missing Coordinates");
  });

  it("should display 'Missing Details' for missing_details issue type", () => {
    const issues: EventIssue[] = [
      {
        eventShortName: "event1",
        eventAmbassador: "EA1",
        regionalAmbassador: "RA1",
        issueType: "missing_details",
        status: "unresolved",
      },
    ];

    populateIssuesTable(
      issues,
      issuesState,
      onIssueSelect,
      onResolve
    );

    const row = tableBody.querySelector("tr");
    const cells = row?.querySelectorAll("td");
    expect(cells?.[3].textContent).toBe("Missing Details");
  });

  it("should filter out resolved issues", () => {
    const issues: EventIssue[] = [
      {
        eventShortName: "event1",
        eventAmbassador: "EA1",
        regionalAmbassador: "RA1",
        issueType: "missing_coordinates",
        status: "unresolved",
      },
      {
        eventShortName: "event2",
        eventAmbassador: "EA2",
        regionalAmbassador: "RA2",
        issueType: "missing_coordinates",
        status: "resolved",
        resolutionMethod: "found_in_events_json",
        resolvedAt: Date.now(),
      },
    ];

    populateIssuesTable(
      issues,
      issuesState,
      onIssueSelect,
      onResolve
    );

    const rows = tableBody.querySelectorAll("tr");
    expect(rows.length).toBe(1);
    expect(rows[0].getAttribute("data-issue-event-name")).toBe("event1");
  });

  it("should call onIssueSelect when row is clicked", () => {
    const issues: EventIssue[] = [
      {
        eventShortName: "event1",
        eventAmbassador: "EA1",
        regionalAmbassador: "RA1",
        issueType: "missing_coordinates",
        status: "unresolved",
      },
    ];

    populateIssuesTable(
      issues,
      issuesState,
      onIssueSelect,
      onResolve
    );

    const row = tableBody.querySelector("tr");
    row?.dispatchEvent(new MouseEvent("click"));

    expect(onIssueSelect).toHaveBeenCalledWith(issues[0]);
  });

  it("should call onResolve when Resolve button is clicked", () => {
    const issues: EventIssue[] = [
      {
        eventShortName: "event1",
        eventAmbassador: "EA1",
        regionalAmbassador: "RA1",
        issueType: "missing_coordinates",
        status: "unresolved",
      },
    ];

    populateIssuesTable(
      issues,
      issuesState,
      onIssueSelect,
      onResolve
    );

    const buttons = Array.from(tableBody.querySelectorAll("button"));
    const resolveBtn = buttons.find((btn) => btn.textContent?.includes("Resolve"));

    resolveBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onResolve).toHaveBeenCalledWith(issues[0]);
  });

  it("should display single Resolve button with correct icon and text", () => {
    const issues: EventIssue[] = [
      {
        eventShortName: "event1",
        eventAmbassador: "EA1",
        regionalAmbassador: "RA1",
        issueType: "missing_coordinates",
        status: "unresolved",
      },
    ];

    populateIssuesTable(
      issues,
      issuesState,
      onIssueSelect,
      onResolve
    );

    const buttons = Array.from(tableBody.querySelectorAll("button"));
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toBe("🔧 Resolve");
    expect(buttons[0].getAttribute("aria-label")).toContain("Resolve issue for event1");
  });

  it("should add selected class to row when issue is selected", () => {
    const issues: EventIssue[] = [
      {
        eventShortName: "event1",
        eventAmbassador: "EA1",
        regionalAmbassador: "RA1",
        issueType: "missing_coordinates",
        status: "unresolved",
      },
    ];

    issuesState.selectedIssue = "event1";

    populateIssuesTable(
      issues,
      issuesState,
      onIssueSelect,
      onResolve
    );

    // After sorting, find the row by data attribute
    const row = tableBody.querySelector("tr[data-issue-event-name='event1']");
    expect(row?.classList.contains("selected")).toBe(true);
  });
});
