export interface EventTeamsTableData {
  eventShortName: string;
  eventDirectors: string;
  eventAmbassador: string;
  regionalAmbassador: string;
  eventCoordinates: string;
  eventSeries: number;
  eventCountryCode: number;
  eventCountry: string;
}

export type EventTeamsTableDataMap = Map<string, EventTeamsTableData>;

export function eventAmbassadorsFrom(data: EventTeamsTableDataMap): string[] {
  return [...new Set(
    Array.from(data.values())
    .map(data => data.eventAmbassador)
    .sort((a, b) => a.localeCompare(b))
  )];
}

export function regionalAmbassadorsFrom(data: EventTeamsTableDataMap): string[] {
  return [...new Set(
    Array.from(data.values())
    .map(data => data.regionalAmbassador)
    .sort((a, b) => a.localeCompare(b))
  )];
}

export function ambassadorNamesFrom(data: EventTeamsTableDataMap): string[] {
  return Array.from(new Set([
    ...eventAmbassadorsFrom(data),
    ...regionalAmbassadorsFrom(data)
  ])).sort((a, b) => a.localeCompare(b));
}
