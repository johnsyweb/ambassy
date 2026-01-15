import {
  initializeTableSorting,
  sortTable,
  getSortState,
  resetToDefaultSort,
  updateSortIndicators,
  clearSortIndicators,
} from "./tableSorting";
import { highlightTableRow } from "./tableMapNavigation";

jest.mock("./tableMapNavigation");

describe("tableSorting", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  describe("initializeTableSorting", () => {
    it("should initialize sorting for a table", () => {
      document.body.innerHTML = `
        <table id="testTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr data-id="1">
              <td>Charlie</td>
              <td>30</td>
              <td><button>Action</button></td>
            </tr>
            <tr data-id="2">
              <td>Alice</td>
              <td>20</td>
              <td><button>Action</button></td>
            </tr>
            <tr data-id="3">
              <td>Bob</td>
              <td>10</td>
              <td><button>Action</button></td>
            </tr>
          </tbody>
        </table>
      `;

      initializeTableSorting("testTable", 0, "asc");

      const state = getSortState("testTable");
      expect(state).not.toBeNull();
      expect(state?.defaultColumn).toBe(0);
      expect(state?.defaultDirection).toBe("asc");
    });

    it("should make headers clickable", () => {
      document.body.innerHTML = `
        <table id="testTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Alice</td><td>10</td></tr>
          </tbody>
        </table>
      `;

      initializeTableSorting("testTable", 0, "asc");

      const headers = document.querySelectorAll("#testTable thead th");
      expect(headers[0].getAttribute("role")).toBe("columnheader");
      expect(headers[0].getAttribute("tabindex")).toBe("0");
      expect(headers[0].getAttribute("aria-label")).toContain("Sort by Name");
    });

    it("should skip Actions column", () => {
      document.body.innerHTML = `
        <table id="testTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Alice</td><td><button>Action</button></td></tr>
          </tbody>
        </table>
      `;

      initializeTableSorting("testTable", 0, "asc");

      const headers = document.querySelectorAll("#testTable thead th");
      expect(headers[1].getAttribute("tabindex")).toBeNull();
    });

    it("should throw error if table not found", () => {
      expect(() => {
        initializeTableSorting("nonExistent", 0, "asc");
      }).toThrow('Table with ID "nonExistent" not found');
    });

    it("should throw error if default column is invalid", () => {
      document.body.innerHTML = `
        <table id="testTable">
          <thead>
            <tr>
              <th>Name</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `;

      expect(() => {
        initializeTableSorting("testTable", 5, "asc");
      }).toThrow("Default column index 5 is invalid");
    });
  });

  describe("sortTable", () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table id="testTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr data-event-short-name="row3">
              <td>Charlie</td>
              <td>30</td>
            </tr>
            <tr data-event-short-name="row1">
              <td>Alice</td>
              <td>20</td>
            </tr>
            <tr data-event-short-name="row2">
              <td>Bob</td>
              <td>10</td>
            </tr>
          </tbody>
        </table>
      `;

      initializeTableSorting("testTable", 0, "asc");
    });

    it("should sort table by column ascending", () => {
      // After initialization, table is already sorted by default column (0) ascending
      // Verify the sort state
      const state = getSortState("testTable");
      expect(state?.sortColumn).toBe(0);
      expect(state?.sortDirection).toBe("asc");

      const rows = document.querySelectorAll("#testTable tbody tr");
      expect(rows[0].getAttribute("data-event-short-name")).toBe("row1");
      expect(rows[1].getAttribute("data-event-short-name")).toBe("row2");
      expect(rows[2].getAttribute("data-event-short-name")).toBe("row3");
    });

    it("should toggle sort direction when clicking same column", () => {
      // After initialization, table is already sorted ascending by default column (0)
      // So first click toggles to descending
      sortTable("testTable", 0);

      const rows = document.querySelectorAll("#testTable tbody tr");
      expect(rows[0].getAttribute("data-event-short-name")).toBe("row3");
      expect(rows[1].getAttribute("data-event-short-name")).toBe("row2");
      expect(rows[2].getAttribute("data-event-short-name")).toBe("row1");
    });

    it("should sort by new column ascending when clicking different column", () => {
      sortTable("testTable", 0);
      sortTable("testTable", 1);

      const state = getSortState("testTable");
      expect(state?.sortColumn).toBe(1);
      expect(state?.sortDirection).toBe("asc");
    });

    it("should sort numbers correctly", () => {
      sortTable("testTable", 1);

      const rows = document.querySelectorAll("#testTable tbody tr");
      expect(rows[0].getAttribute("data-event-short-name")).toBe("row2");
      expect(rows[1].getAttribute("data-event-short-name")).toBe("row1");
      expect(rows[2].getAttribute("data-event-short-name")).toBe("row3");
    });

    it("should preserve row selection during sort", () => {
      const tbody = document.querySelector("#testTable tbody")!;
      const row2 = tbody.querySelector("tr[data-event-short-name='row2']")!;
      row2.classList.add("selected");
      row2.setAttribute("aria-selected", "true");

      sortTable("testTable", 0);

      const sortedRow2 = tbody.querySelector("tr[data-event-short-name='row2']");
      expect(sortedRow2?.classList.contains("selected")).toBe(true);
      expect(highlightTableRow).toHaveBeenCalledWith("testTable", "row2", true);
    });

    it("should throw error if table not initialized", () => {
      document.body.innerHTML = `
        <table id="otherTable">
          <tbody>
            <tr><td>Test</td></tr>
          </tbody>
        </table>
      `;

      expect(() => {
        sortTable("otherTable", 0);
      }).toThrow('Table "otherTable" is not initialized for sorting');
    });
  });

  describe("getSortState", () => {
    it("should return null for uninitialized table", () => {
      expect(getSortState("nonExistent")).toBeNull();
    });

    it("should return state for initialized table", () => {
      document.body.innerHTML = `
        <table id="testTable">
          <thead>
            <tr><th>Name</th></tr>
          </thead>
          <tbody>
            <tr><td>Test</td></tr>
          </tbody>
        </table>
      `;

      initializeTableSorting("testTable", 0, "asc");
      const state = getSortState("testTable");

      expect(state).not.toBeNull();
      expect(state?.tableId).toBe("testTable");
    });
  });

  describe("resetToDefaultSort", () => {
    it("should reset to default sort", () => {
      document.body.innerHTML = `
        <table id="testTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr data-event-short-name="row3">
              <td>Charlie</td>
              <td>30</td>
            </tr>
            <tr data-event-short-name="row1">
              <td>Alice</td>
              <td>20</td>
            </tr>
            <tr data-event-short-name="row2">
              <td>Bob</td>
              <td>10</td>
            </tr>
          </tbody>
        </table>
      `;

      initializeTableSorting("testTable", 0, "asc");
      // After initialization, table is sorted by default column (0) ascending
      // Sort by column 1 to change sort
      sortTable("testTable", 1);
      // Reset should go back to default (column 0, but direction may be toggled)
      resetToDefaultSort("testTable");

      const state = getSortState("testTable");
      expect(state?.sortColumn).toBe(0);
      // After reset, default sort is applied which may toggle direction
      expect(state?.sortDirection).toBe("asc");
    });

    it("should throw error if table not initialized", () => {
      expect(() => {
        resetToDefaultSort("nonExistent");
      }).toThrow('Table "nonExistent" is not initialized for sorting');
    });
  });

  describe("updateSortIndicators", () => {
    it("should update visual indicators", () => {
      document.body.innerHTML = `
        <table id="testTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Alice</td><td>10</td></tr>
          </tbody>
        </table>
      `;

      initializeTableSorting("testTable", 0, "asc");
      // After initialization, default sort is already applied (ascending)
      // So the header should already show ascending indicator
      const header = document.querySelector("#testTable thead th")!;
      expect(header.textContent).toContain("↑");
      expect(header.getAttribute("aria-sort")).toBe("ascending");
    });
  });

  describe("clearSortIndicators", () => {
    it("should clear all sort indicators", () => {
      document.body.innerHTML = `
        <table id="testTable">
          <thead>
            <tr>
              <th>Name ↑</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Alice</td><td>10</td></tr>
          </tbody>
        </table>
      `;

      clearSortIndicators("testTable");

      const header = document.querySelector("#testTable thead th")!;
      expect(header.textContent).not.toContain("↑");
      expect(header.getAttribute("aria-sort")).toBe("none");
    });
  });
});
