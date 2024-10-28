import { EventTeam } from "./EventTeam";

export interface EventDetails {
  id: string;
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
  associatedTeam?: EventTeam;
}
