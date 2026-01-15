import { EventIssue } from "@models/EventIssue";
import { IssuesState } from "@models/IssuesState";
import { initializeTableSorting } from "./tableSorting";

export function populateIssuesTable(
  issues: EventIssue[],
  issuesState: IssuesState,
  onIssueSelect: (issue: EventIssue) => void,
  onResolve: (issue: EventIssue) => void
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
    const resolveButton = document.createElement("button");
    resolveButton.textContent = "🔧 Resolve";
    resolveButton.type = "button";
    resolveButton.title = "Resolve this issue by searching events or entering an address";
    resolveButton.setAttribute("aria-label", `Resolve issue for ${issue.eventShortName}`);
    resolveButton.style.padding = "2px 8px";
    resolveButton.style.fontSize = "0.85em";
    resolveButton.style.cursor = "pointer";
    resolveButton.addEventListener("click", (e) => {
      e.stopPropagation();
      onResolve(issue);
    });
    resolveButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        onResolve(issue);
      }
    });
    actionsCell.appendChild(resolveButton);
    row.appendChild(actionsCell);

    row.addEventListener("click", () => {
      onIssueSelect(issue);
    });

    row.style.cursor = "pointer";
    tableBody.appendChild(row);
  });

  // Initialize sorting with default: Event Name (column 0) ascending
  // Only initialize if we have unresolved issues (not empty state)
  if (unresolvedIssues.length > 0) {
    initializeTableSorting('issuesTable', 0, 'asc');
    
    // Apply selection after sorting (sorting may have reordered rows)
    if (issuesState.selectedIssue) {
      const selectedRow = tableBody.querySelector(`tr[data-issue-event-name="${issuesState.selectedIssue}"]`);
      if (selectedRow) {
        selectedRow.classList.add("selected");
        selectedRow.setAttribute("aria-selected", "true");
      }
    }
  } else if (issuesState.selectedIssue) {
    // If no unresolved issues but there's a selection, clear it
    const selectedRow = tableBody.querySelector("tr.selected");
    if (selectedRow) {
      selectedRow.classList.remove("selected");
      selectedRow.setAttribute("aria-selected", "false");
    }
  }
}
