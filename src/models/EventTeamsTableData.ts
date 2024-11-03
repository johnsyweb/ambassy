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

