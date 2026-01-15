export type ColumnType = "text" | "number" | "date" | "boolean";

export function compareText(a: string, b: string): number {
  if (a === "" && b === "") return 0;
  if (a === "") return 1;
  if (b === "") return -1;
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

export function compareNumbers(a: number, b: number): number {
  if (isNaN(a) && isNaN(b)) return 0;
  if (isNaN(a)) return 1;
  if (isNaN(b)) return -1;
  return a - b;
}

export function compareDates(a: Date, b: Date): number {
  if (isNaN(a.getTime()) && isNaN(b.getTime())) return 0;
  if (isNaN(a.getTime())) return 1;
  if (isNaN(b.getTime())) return -1;
  return a.getTime() - b.getTime();
}

export function compareBooleans(a: boolean, b: boolean): number {
  if (a === b) return 0;
  return a ? 1 : -1;
}

export function parseCellValue(
  cellText: string,
  type: ColumnType,
): string | number | Date | boolean | null {
  const trimmed = cellText.trim();
  if (trimmed === "") return null;

  switch (type) {
    case "number": {
      const num = parseFloat(trimmed.replace(/[^\d.-]/g, ""));
      return isNaN(num) ? null : num;
    }
    case "date": {
      const date = new Date(trimmed);
      return isNaN(date.getTime()) ? null : date;
    }
    case "boolean": {
      const lower = trimmed.toLowerCase();
      if (
        lower === "true" ||
        lower === "yes" ||
        lower === "✅" ||
        lower === "1"
      ) {
        return true;
      }
      if (
        lower === "false" ||
        lower === "no" ||
        lower === "❌" ||
        lower === "0"
      ) {
        return false;
      }
      return null;
    }
    case "text":
    default:
      return trimmed;
  }
}

export function detectColumnType(
  tableId: string,
  columnIndex: number,
): ColumnType {
  const table = document.querySelector(`#${tableId} tbody`);
  if (!table) {
    return "text";
  }

  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length === 0) {
    return "text";
  }

  const sampleSize = Math.min(10, rows.length);
  const samples: string[] = [];

  for (let i = 0; i < sampleSize; i++) {
    const cells = rows[i].querySelectorAll("td");
    if (cells[columnIndex]) {
      const text = cells[columnIndex].textContent?.trim() || "";
      if (text !== "") {
        samples.push(text);
      }
    }
  }

  if (samples.length === 0) {
    return "text";
  }

  let numberCount = 0;
  let dateCount = 0;
  let booleanCount = 0;

  for (const sample of samples) {
    const num = parseFloat(sample.replace(/[^\d.-]/g, ""));
    if (!isNaN(num) && sample.match(/^-?\d*\.?\d+$/)) {
      numberCount++;
    }

    const date = new Date(sample);
    if (!isNaN(date.getTime()) && date.toISOString() !== "1970-01-01T00:00:00.000Z") {
      dateCount++;
    }

    const lower = sample.toLowerCase();
    if (
      lower === "true" ||
      lower === "false" ||
      lower === "yes" ||
      lower === "no" ||
      lower === "✅" ||
      lower === "❌"
    ) {
      booleanCount++;
    }
  }

  const threshold = samples.length * 0.6;

  if (numberCount >= threshold) {
    return "number";
  }
  if (dateCount >= threshold) {
    return "date";
  }
  if (booleanCount >= threshold) {
    return "boolean";
  }

  return "text";
}
