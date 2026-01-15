import {
  createTableSortState,
  resetToDefault,
} from "./TableSortState";

describe("TableSortState", () => {
  describe("createTableSortState", () => {
    it("should create a state with default column and direction", () => {
      const state = createTableSortState("testTable", 2, "asc");

      expect(state.tableId).toBe("testTable");
      expect(state.sortColumn).toBeNull();
      expect(state.sortDirection).toBe("asc");
      expect(state.defaultColumn).toBe(2);
      expect(state.defaultDirection).toBe("asc");
    });

    it("should create a state with descending default direction", () => {
      const state = createTableSortState("testTable", 0, "desc");

      expect(state.defaultDirection).toBe("desc");
      expect(state.sortDirection).toBe("desc");
    });
  });

  describe("resetToDefault", () => {
    it("should reset sort column and direction to defaults", () => {
      const state = createTableSortState("testTable", 2, "asc");
      state.sortColumn = 5;
      state.sortDirection = "desc";

      resetToDefault(state);

      expect(state.sortColumn).toBe(2);
      expect(state.sortDirection).toBe("asc");
    });

    it("should reset to descending default", () => {
      const state = createTableSortState("testTable", 1, "desc");
      state.sortColumn = 3;
      state.sortDirection = "asc";

      resetToDefault(state);

      expect(state.sortColumn).toBe(1);
      expect(state.sortDirection).toBe("desc");
    });
  });
});
