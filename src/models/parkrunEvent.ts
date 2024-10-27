export interface parkrunEvent {
  id: number;
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    eventname: string;
    EventLongName: string;
    EventShortName: string;
    LocalisedEventLongName: string | null;
    countrycode: number;
    seriesid: number;
    EventLocation: string;
  };
}
