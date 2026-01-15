import { TableSortState, createTableSortState, resetToDefault } from "@models/TableSortState";
import {
  ColumnType,
  compareText,
  compareNumbers,
  compareDates,
  compareBooleans,
  parseCellValue,
  detectColumnType,
} from "@utils/sortComparators";
import { highlightTableRow } from "./tableMapNavigation";

const sortStates = new Map<string, TableSortState>();

function getRowIdentifier(row: HTMLTableRowElement): string | null {
  return (
    row.getAttribute("data-event-short-name") ||
    row.getAttribute("data-ea-name") ||
    row.getAttribute("data-ra-name") ||
    row.getAttribute("data-prospect-id") ||
    row.getAttribute("data-issue-event-name") ||
    null
  );
}

function getSelectedRowIdentifier(tableId: string): string | null {
  const table = document.querySelector(`#${tableId} tbody`);
  if (!table) {
    return null;
  }

  const selectedRow = table.querySelector("tr.selected");
  if (!selectedRow) {
    return null;
  }

  return getRowIdentifier(selectedRow as HTMLTableRowElement);
}

function preserveAndRestoreSelection(
  tableId: string,
  sortFn: () => void,
): void {
  const selectedId = getSelectedRowIdentifier(tableId);
  sortFn();

  if (selectedId) {
    const table = document.querySelector(`#${tableId} tbody`);
    if (table) {
      const rows = Array.from(table.querySelectorAll("tr"));
      for (const row of rows) {
        const rowId = getRowIdentifier(row as HTMLTableRowElement);
        if (rowId === selectedId) {
          highlightTableRow(tableId, selectedId, true);
          break;
        }
      }
    }
  }
}

export function initializeTableSorting(
  tableId: string,
  defaultColumn: number,
  defaultDirection: "asc" | "desc",
): void {
  const table = document.querySelector(`#${tableId}`);
  if (!table) {
    throw new Error(`Table with ID "${tableId}" not found`);
  }

  const thead = table.querySelector("thead");
  if (!thead) {
    throw new Error(`Table "${tableId}" must have a thead element`);
  }

  const headers = Array.from(thead.querySelectorAll("th"));
  if (defaultColumn < 0 || defaultColumn >= headers.length) {
    throw new Error(
      `Default column index ${defaultColumn} is invalid for table "${tableId}"`,
    );
  }

  const state = createTableSortState(tableId, defaultColumn, defaultDirection);
  sortStates.set(tableId, state);

  headers.forEach((header, index) => {
    const headerText = header.textContent?.trim() || "";
    if (headerText === "" || headerText.toLowerCase() === "actions") {
      return;
    }

    header.setAttribute("role", "columnheader");
    header.setAttribute("tabindex", "0");
    header.setAttribute(
      "aria-label",
      `Sort by ${headerText}. Click to sort.`,
    );
    header.style.cursor = "pointer";
    header.style.userSelect = "none";

    const handleSort = (): void => {
      sortTable(tableId, index);
    };

    header.addEventListener("click", handleSort);

    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSort();
      }
    });
  });

  applyDefaultSort(tableId);
}

export function sortTable(
  tableId: string,
  columnIndex: number,
  columnType?: ColumnType,
): void {
  const state = sortStates.get(tableId);
  if (!state) {
    throw new Error(`Table "${tableId}" is not initialized for sorting`);
  }

  const table = document.querySelector(`#${tableId} tbody`);
  if (!table) {
    throw new Error(`Table body not found for "${tableId}"`);
  }

  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length === 0) {
    return;
  }

  const detectedType = columnType || detectColumnType(tableId, columnIndex);

  let sortDirection: "asc" | "desc" = "asc";
  if (state.sortColumn === columnIndex) {
    sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
  }

  state.sortColumn = columnIndex;
  state.sortDirection = sortDirection;

  const sortedRows = [...rows].sort((a, b) => {
    const aCell = a.querySelectorAll("td")[columnIndex];
    const bCell = b.querySelectorAll("td")[columnIndex];

    if (!aCell || !bCell) {
      return 0;
    }

    const aText = aCell.textContent?.trim() || "";
    const bText = bCell.textContent?.trim() || "";

    const aValue = parseCellValue(aText, detectedType);
    const bValue = parseCellValue(bText, detectedType);

    if (aValue === null && bValue === null) {
      return 0;
    }
    if (aValue === null) {
      return 1;
    }
    if (bValue === null) {
      return -1;
    }

    let comparison = 0;
    if (detectedType === "number" && typeof aValue === "number" && typeof bValue === "number") {
      comparison = compareNumbers(aValue, bValue);
    } else if (detectedType === "date" && aValue instanceof Date && bValue instanceof Date) {
      comparison = compareDates(aValue, bValue);
    } else if (detectedType === "boolean" && typeof aValue === "boolean" && typeof bValue === "boolean") {
      comparison = compareBooleans(aValue, bValue);
    } else {
      comparison = compareText(String(aValue), String(bValue));
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  preserveAndRestoreSelection(tableId, () => {
    sortedRows.forEach((row) => {
      table.appendChild(row);
    });
  });

  updateSortIndicators(tableId);
}

export function getSortState(tableId: string): TableSortState | null {
  return sortStates.get(tableId) || null;
}

export function resetToDefaultSort(tableId: string): void {
  const state = sortStates.get(tableId);
  if (!state) {
    throw new Error(`Table "${tableId}" is not initialized for sorting`);
  }

  resetToDefault(state);
  sortTable(tableId, state.defaultColumn);
}

function applyDefaultSort(tableId: string): void {
  const state = sortStates.get(tableId);
  if (!state) {
    return;
  }

  sortTable(tableId, state.defaultColumn);
}

export function updateSortIndicators(tableId: string): void {
  const state = sortStates.get(tableId);
  if (!state) {
    return;
  }

  const table = document.querySelector(`#${tableId}`);
  if (!table) {
    return;
  }

  const headers = Array.from(table.querySelectorAll("thead th"));

  headers.forEach((header, index) => {
    const headerText = header.textContent?.trim() || "";
    if (headerText === "" || headerText.toLowerCase() === "actions") {
      return;
    }

    let currentText = headerText.replace(/[↑↓↕]/g, "").trim();

    if (state.sortColumn === index) {
      const arrow = state.sortDirection === "asc" ? " ↑" : " ↓";
      currentText += arrow;
      header.setAttribute("aria-sort", state.sortDirection === "asc" ? "ascending" : "descending");
    } else {
      header.setAttribute("aria-sort", "none");
    }

    header.textContent = currentText;
  });
}

export function clearSortIndicators(tableId: string): void {
  const table = document.querySelector(`#${tableId}`);
  if (!table) {
    return;
  }

  const headers = Array.from(table.querySelectorAll("thead th"));

  headers.forEach((header) => {
    const headerText = header.textContent?.trim() || "";
    if (headerText === "" || headerText.toLowerCase() === "actions") {
      return;
    }

    const currentText = headerText.replace(/[↑↓↕]/g, "").trim();
    header.textContent = currentText;
    header.setAttribute("aria-sort", "none");
  });
}
