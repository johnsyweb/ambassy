import { populateIssuesTable } from "./populateIssuesTable";
import { EventIssue } from "@models/EventIssue";
import { IssuesState, createIssuesState } from "@models/IssuesState";

describe("populateIssuesTable", () => {
  let tableBody: HTMLTableSectionElement;
  let issuesState: IssuesState;
  let onIssueSelect: jest.Mock;
  let onSearchEvents: jest.Mock;
  let onEnterAddress: jest.Mock;

  beforeEach(() => {
    document.body.innerHTML = `
      <table id="issuesTable">
        <tbody></tbody>
      </table>
    `;
    tableBody = document.querySelector("#issuesTable tbody")!;
    issuesState = createIssuesState();
    onIssueSelect = jest.fn();
    onSearchEvents = jest.fn();
    onEnterAddress = jest.fn();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should display empty state when no issues", () => {
    populateIssuesTable(
      [],
      issuesState,
      onIssueSelect,
      onSearchEvents,
      onEnterAddress
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
      onSearchEvents,
      onEnterAddress
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
      onSearchEvents,
      onEnterAddress
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
      onSearchEvents,
      onEnterAddress
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
      onSearchEvents,
      onEnterAddress
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
      onSearchEvents,
      onEnterAddress
    );

    const row = tableBody.querySelector("tr");
    row?.dispatchEvent(new MouseEvent("click"));

    expect(onIssueSelect).toHaveBeenCalledWith(issues[0]);
  });

  it("should call onSearchEvents when Search Events button is clicked", () => {
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
      onSearchEvents,
      onEnterAddress
    );

    const buttons = Array.from(tableBody.querySelectorAll("button"));
    const searchBtn = buttons.find((btn) => btn.textContent?.includes("Search"));

    searchBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onSearchEvents).toHaveBeenCalledWith(issues[0]);
  });

  it("should call onEnterAddress when Enter Address button is clicked", () => {
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
      onSearchEvents,
      onEnterAddress
    );

    const buttons = Array.from(tableBody.querySelectorAll("button"));
    const addressBtn = buttons.find((btn) => btn.textContent?.includes("Enter Address"));

    addressBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onEnterAddress).toHaveBeenCalledWith(issues[0]);
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
      onSearchEvents,
      onEnterAddress
    );

    const row = tableBody.querySelector("tr");
    expect(row?.classList.contains("selected")).toBe(true);
  });
});
