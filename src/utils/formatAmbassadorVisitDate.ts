const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatAmbassadorVisitDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map((part) => Number(part));
  if (!year || !month || !day) {
    return isoDate;
  }

  const monthName = MONTH_NAMES[month - 1];
  if (!monthName) {
    return isoDate;
  }

  return `${day} ${monthName} ${year}`;
}

export function formatLastAmbassadorVisit(
  ambassadorNames: string[],
  isoDate: string,
): string {
  const sortedNames = [...ambassadorNames].sort((a, b) => a.localeCompare(b));
  return `${sortedNames.join("; ")} — ${formatAmbassadorVisitDate(isoDate)}`;
}
