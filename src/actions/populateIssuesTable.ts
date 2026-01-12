import { EventIssue } from "@models/EventIssue";
import { IssuesState } from "@models/IssuesState";

export function populateIssuesTable(
  issues: EventIssue[],
  issuesState: IssuesState,
  onIssueSelect: (issue: EventIssue) => void,
  onSearchEvents: (issue: EventIssue) => void,
  onEnterAddress: (issue: EventIssue) => void
): void {
  const tableBody = document.querySelector("#issuesTable tbody");
  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = "";

  if (issues.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No issues found. All events have coordinates.";
    cell.style.textAlign = "center";
    cell.style.padding = "1em";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  const unresolvedIssues = issues.filter((issue) => issue.status === "unresolved");

  unresolvedIssues.forEach((issue) => {
    const row = document.createElement("tr");
    row.setAttribute("data-issue-event-name", issue.eventShortName);

    if (issuesState.selectedIssue === issue.eventShortName) {
      row.classList.add("selected");
    }

    const eventNameCell = document.createElement("td");
    eventNameCell.textContent = issue.eventShortName;
    row.appendChild(eventNameCell);

    const eventAmbassadorCell = document.createElement("td");
    eventAmbassadorCell.textContent = issue.eventAmbassador;
    row.appendChild(eventAmbassadorCell);

    const regionalAmbassadorCell = document.createElement("td");
    regionalAmbassadorCell.textContent = issue.regionalAmbassador;
    row.appendChild(regionalAmbassadorCell);

    const issueTypeCell = document.createElement("td");
    issueTypeCell.textContent =
      issue.issueType === "missing_coordinates"
        ? "Missing Coordinates"
        : "Missing Details";
    row.appendChild(issueTypeCell);

    const actionsCell = document.createElement("td");
    const actionsContainer = document.createElement("div");
    actionsContainer.style.display = "flex";
    actionsContainer.style.gap = "6px";

    const searchButton = document.createElement("button");
    searchButton.textContent = "🔍 Search Events";
    searchButton.type = "button";
    searchButton.addEventListener("click", (e) => {
      e.stopPropagation();
      onSearchEvents(issue);
    });
    searchButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        onSearchEvents(issue);
      }
    });
    actionsContainer.appendChild(searchButton);

    const enterAddressButton = document.createElement("button");
    enterAddressButton.textContent = "📍 Enter Address";
    enterAddressButton.type = "button";
    enterAddressButton.addEventListener("click", (e) => {
      e.stopPropagation();
      onEnterAddress(issue);
    });
    enterAddressButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        onEnterAddress(issue);
      }
    });
    actionsContainer.appendChild(enterAddressButton);

    actionsCell.appendChild(actionsContainer);
    row.appendChild(actionsCell);

    row.addEventListener("click", () => {
      onIssueSelect(issue);
    });

    row.style.cursor = "pointer";
    tableBody.appendChild(row);
  });
}
