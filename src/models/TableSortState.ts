export interface TableSortState {
  tableId: string;
  sortColumn: number | null;
  sortDirection: "asc" | "desc";
  defaultColumn: number;
  defaultDirection: "asc" | "desc";
}

export function createTableSortState(
  tableId: string,
  defaultColumn: number,
  defaultDirection: "asc" | "desc",
): TableSortState {
  return {
    tableId,
    sortColumn: null,
    sortDirection: defaultDirection,
    defaultColumn,
    defaultDirection,
  };
}

export function resetToDefault(state: TableSortState): void {
  state.sortColumn = state.defaultColumn;
  state.sortDirection = state.defaultDirection;
}
