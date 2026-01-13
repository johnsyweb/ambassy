import { Coordinate, fromGeoJSONArray, toGeoJSONArray } from './Coordinate';

/**
 * EventDetails from parkrun API (GeoJSON format)
 * Note: geometry.coordinates is [longitude, latitude] per GeoJSON spec
 */
export interface EventDetails {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // GeoJSON format: [longitude, latitude]
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

/**
 * Converts EventDetails geometry to Coordinate (internal format)
 */
export function eventDetailsToCoordinate(event: EventDetails): Coordinate {
  return fromGeoJSONArray(event.geometry.coordinates);
}

/**
 * Creates EventDetails geometry from Coordinate (internal format)
 */
export function coordinateToEventDetailsGeometry(coord: Coordinate): [number, number] {
  return toGeoJSONArray(coord);
}
