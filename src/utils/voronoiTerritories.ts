import { eventDetailsToCoordinate } from "@models/EventDetailsMap";
import {
  EventDetailsMap,
  getEventTeamsTableDataByShortName,
} from "@models/EventDetailsMap";
import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { isValidCoordinate, toGeoJSONArray } from "@models/Coordinate";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { Feature, Polygon } from "geojson";
import L from "leaflet";

export type VoronoiSiteRole = "visible" | "constraining";

export interface VoronoiSite {
  id: string;
  longitude: number;
  latitude: number;
  role: VoronoiSiteRole;
  raColor?: string;
  tooltip?: string;
}

export interface TerritoryRing {
  id: string;
  ring: [number, number][];
  raColor: string;
  tooltip: string;
}

export interface ViewportBounds {
  minLongitude: number;
  maxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
}

export type GeoVoronoiFn = (points: [number, number][]) => {
  polygons(): { features: Feature<Polygon>[] };
};

const DUPLICATE_COORDINATE_EPSILON = 0.000001;
const MAX_TERRITORY_VERTEX_DISTANCE_DEGREES = 35;
const MAX_TERRITORY_WRAP_EDGE_DEGREES = 25;
const MAX_LOCAL_REPAIR_LONGITUDE_OFFSET_DEGREES = 6;
const MAX_TERRITORY_LONGITUDE_SPAN_DEGREES = 120;

export interface BuildVoronoiSitesInput {
  eventDetails: EventDetailsMap;
  eventTeamsTableData: EventTeamsTableDataMap;
  prospectiveEvents?: ProspectiveEvent[];
  styleForAllocatedEvent: (eventShortName: string) => {
    raColor: string;
    tooltip: string;
  };
  styleForProspect?: (prospect: ProspectiveEvent) => {
    raColor: string;
    tooltip: string;
  };
}

function coordinateFromEventDetails(
  eventDetails: EventDetailsMap,
  eventShortName: string,
): { longitude: number; latitude: number } | null {
  const event = eventDetails.get(eventShortName);
  if (!event?.geometry?.coordinates) {
    return null;
  }

  try {
    const coordinate = eventDetailsToCoordinate(event);
    if (!isValidCoordinate(coordinate)) {
      return null;
    }
    const [longitude, latitude] = toGeoJSONArray(coordinate);
    return { longitude, latitude };
  } catch {
    return null;
  }
}

export function buildVoronoiSites(
  input: BuildVoronoiSitesInput,
): VoronoiSite[] {
  const sites: VoronoiSite[] = [];

  input.eventDetails.forEach((_event, eventShortName) => {
    const position = coordinateFromEventDetails(
      input.eventDetails,
      eventShortName,
    );
    if (!position) {
      return;
    }

    if (
      getEventTeamsTableDataByShortName(
        input.eventTeamsTableData,
        eventShortName,
      )
    ) {
      const style = input.styleForAllocatedEvent(eventShortName);
      sites.push({
        id: eventShortName,
        longitude: position.longitude,
        latitude: position.latitude,
        role: "visible",
        raColor: style.raColor,
        tooltip: style.tooltip,
      });
      return;
    }

    sites.push({
      id: eventShortName,
      longitude: position.longitude,
      latitude: position.latitude,
      role: "constraining",
    });
  });

  input.prospectiveEvents?.forEach((prospect) => {
    if (
      !prospect.eventAmbassador ||
      !prospect.coordinates ||
      prospect.geocodingStatus !== "success" ||
      !isValidCoordinate(prospect.coordinates) ||
      !input.styleForProspect
    ) {
      return;
    }

    const [longitude, latitude] = toGeoJSONArray(prospect.coordinates);
    const style = input.styleForProspect(prospect);
    sites.push({
      id: `prospect:${prospect.id}`,
      longitude,
      latitude,
      role: "visible",
      raColor: style.raColor,
      tooltip: style.tooltip,
    });
  });

  return sites;
}

export function deduplicateVoronoiSites(sites: VoronoiSite[]): VoronoiSite[] {
  return sites.filter((site, index, allSites) => {
    return !allSites.slice(0, index).some((otherSite) => {
      return (
        Math.abs(site.longitude - otherSite.longitude) <
          DUPLICATE_COORDINATE_EPSILON &&
        Math.abs(site.latitude - otherSite.latitude) <
          DUPLICATE_COORDINATE_EPSILON
      );
    });
  });
}

export function fingerprintVoronoiSites(sites: VoronoiSite[]): string {
  return deduplicateVoronoiSites(sites)
    .map((site) =>
      [
        site.id,
        site.role,
        site.longitude.toFixed(6),
        site.latitude.toFixed(6),
        site.raColor ?? "",
        site.tooltip ?? "",
      ].join("|"),
    )
    .sort()
    .join("\n");
}

function greatCircleDistanceDegrees(
  from: [number, number],
  to: [number, number],
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLatitude = toRadians(to[1] - from[1]);
  const deltaLongitude = toRadians(to[0] - from[0]);
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(from[1])) *
      Math.cos(toRadians(to[1])) *
      Math.sin(deltaLongitude / 2) ** 2;

  return (2 * 180 * Math.asin(Math.sqrt(haversine))) / Math.PI;
}

function coordinatesNearlyEqual(
  left: [number, number],
  right: { longitude: number; latitude: number },
): boolean {
  return (
    Math.abs(left[0] - right.longitude) < DUPLICATE_COORDINATE_EPSILON &&
    Math.abs(left[1] - right.latitude) < DUPLICATE_COORDINATE_EPSILON
  );
}

function longitudeSpan(ring: [number, number][]): number {
  const longitudes = ring.map(([longitude]) => longitude);
  return Math.max(...longitudes) - Math.min(...longitudes);
}

export function pointInTerritoryRing(
  siteLongitude: number,
  siteLatitude: number,
  ring: [number, number][],
): boolean {
  let inside = false;

  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index++
  ) {
    const [vertexLongitude, vertexLatitude] = ring[index];
    const [previousLongitude, previousLatitude] = ring[previous];
    const crossesLatitude =
      vertexLatitude > siteLatitude !== previousLatitude > siteLatitude;

    if (
      crossesLatitude &&
      siteLongitude <
        ((previousLongitude - vertexLongitude) *
          (siteLatitude - vertexLatitude)) /
          (previousLatitude - vertexLatitude) +
          vertexLongitude
    ) {
      inside = !inside;
    }
  }

  return inside;
}

function westernLongitudeLimit(siteLongitude: number): number {
  return siteLongitude - MAX_LOCAL_REPAIR_LONGITUDE_OFFSET_DEGREES;
}

function vertexIsLocalToSite(
  vertex: [number, number],
  siteLongitude: number,
): boolean {
  return vertex[0] >= westernLongitudeLimit(siteLongitude);
}

function arcIsLocalToSite(
  arc: [number, number][],
  siteLongitude: number,
): boolean {
  return arc.every((vertex) => vertexIsLocalToSite(vertex, siteLongitude));
}

export function extractLocalTerritoryRing(
  ring: [number, number][],
  siteLongitude: number,
  siteLatitude: number,
): [number, number][] | null {
  const siteContainingArcs = splitRingOnWrapEdges(
    ring,
    MAX_TERRITORY_WRAP_EDGE_DEGREES,
  ).filter(
    (arc) =>
      arc.length >= 3 &&
      arcIsLocalToSite(arc, siteLongitude) &&
      pointInTerritoryRing(siteLongitude, siteLatitude, arc),
  );

  if (siteContainingArcs.length > 0) {
    siteContainingArcs.sort(
      (left, right) => longitudeSpan(left) - longitudeSpan(right),
    );
    return siteContainingArcs[0];
  }

  return extractLocalTerritoryRingFromVertexDistance(
    ring,
    siteLongitude,
    siteLatitude,
  );
}

function splitRingOnWrapEdges(
  ring: [number, number][],
  maxEdgeDegrees: number,
): [number, number][][] {
  const arcs: [number, number][][] = [];
  let arc: [number, number][] = [ring[0]];

  for (let index = 1; index < ring.length; index += 1) {
    const edgeLength = greatCircleDistanceDegrees(ring[index - 1], ring[index]);

    if (edgeLength > maxEdgeDegrees) {
      if (arc.length >= 3) {
        arcs.push(arc);
      }
      arc = [ring[index]];
    } else {
      arc.push(ring[index]);
    }
  }

  const closingEdge = greatCircleDistanceDegrees(
    ring[ring.length - 1],
    ring[0],
  );

  if (closingEdge > maxEdgeDegrees) {
    if (arc.length >= 3) {
      arcs.push(arc);
    }
  } else if (arc.length >= 3) {
    arcs.push(arc);
  }

  return arcs;
}

function extractLocalTerritoryRingFromVertexDistance(
  ring: [number, number][],
  siteLongitude: number,
  siteLatitude: number,
): [number, number][] | null {
  const site: [number, number] = [siteLongitude, siteLatitude];
  const localVertices = ring.map(
    (vertex) =>
      greatCircleDistanceDegrees(site, vertex) <=
      MAX_TERRITORY_VERTEX_DISTANCE_DEGREES,
  );

  if (!localVertices.some(Boolean)) {
    return null;
  }

  let bestStart = 0;
  let bestLength = 0;
  const doubled = localVertices.concat(localVertices);
  let runStart = 0;

  for (let index = 0; index < doubled.length; index += 1) {
    if (!doubled[index]) {
      runStart = index + 1;
      continue;
    }

    const runLength = Math.min(index - runStart + 1, ring.length);
    if (runLength > bestLength) {
      bestLength = runLength;
      bestStart = runStart;
    }
  }

  if (bestLength < 3) {
    return null;
  }

  const extracted: [number, number][] = [];
  for (let offset = 0; offset < bestLength; offset += 1) {
    extracted.push(ring[(bestStart + offset) % ring.length]);
  }

  return extracted;
}

export function isDrawableTerritoryRing(
  ring: [number, number][],
  siteLongitude: number,
  siteLatitude: number,
): boolean {
  if (ring.length < 3) {
    return false;
  }

  if (longitudeSpan(ring) > MAX_TERRITORY_LONGITUDE_SPAN_DEGREES) {
    return false;
  }

  return pointInTerritoryRing(siteLongitude, siteLatitude, ring);
}

export function boundaryLatitudeAtLongitude(
  ring: [number, number][],
  longitude: number,
  boundary: "north" | "south",
): number | null {
  const crossings: number[] = [];

  for (let index = 0; index < ring.length; index += 1) {
    const [startLongitude, startLatitude] = ring[index];
    const [endLongitude, endLatitude] = ring[(index + 1) % ring.length];

    if (startLongitude === endLongitude) {
      if (Math.abs(startLongitude - longitude) < 1e-9) {
        crossings.push(startLatitude, endLatitude);
      }
      continue;
    }

    const minLongitude = Math.min(startLongitude, endLongitude);
    const maxLongitude = Math.max(startLongitude, endLongitude);

    if (longitude < minLongitude || longitude > maxLongitude) {
      continue;
    }

    const ratio =
      (longitude - startLongitude) / (endLongitude - startLongitude);
    crossings.push(startLatitude + ratio * (endLatitude - startLatitude));
  }

  if (crossings.length === 0) {
    return null;
  }

  return boundary === "south" ? Math.min(...crossings) : Math.max(...crossings);
}

function findSiteForPolygonFeature(
  feature: Feature<Polygon>,
  uniqueSites: VoronoiSite[],
  index: number,
): VoronoiSite | undefined {
  const siteCoordinates = feature.properties?.sitecoordinates as
    | [number, number]
    | undefined;

  if (siteCoordinates) {
    return uniqueSites.find((site) =>
      coordinatesNearlyEqual(siteCoordinates, site),
    );
  }

  return uniqueSites[index];
}

function extractPolygonRing(
  feature: Feature<Polygon>,
): [number, number][] | null {
  if (feature.geometry.type !== "Polygon") {
    return null;
  }

  const ring = feature.geometry.coordinates[0] as [number, number][];
  return ring.length >= 3 ? ring : null;
}

function selectDrawableTerritoryRing(
  rawRing: [number, number][],
  siteLongitude: number,
  siteLatitude: number,
): [number, number][] | null {
  const extractedRing = extractLocalTerritoryRing(
    rawRing,
    siteLongitude,
    siteLatitude,
  );

  if (
    extractedRing &&
    isDrawableTerritoryRing(extractedRing, siteLongitude, siteLatitude)
  ) {
    return extractedRing;
  }

  if (isDrawableTerritoryRing(rawRing, siteLongitude, siteLatitude)) {
    return rawRing;
  }

  return null;
}

export function computeVisibleTerritoryRings(
  sites: VoronoiSite[],
  geoVoronoiFn: GeoVoronoiFn,
): TerritoryRing[] {
  const uniqueSites = deduplicateVoronoiSites(sites);
  if (uniqueSites.length === 0) {
    return [];
  }

  const geoJsonSites = uniqueSites.map(
    (site) => [site.longitude, site.latitude] as [number, number],
  );
  const voronoi = geoVoronoiFn(geoJsonSites);
  const polygons = voronoi.polygons();
  const rings: TerritoryRing[] = [];

  polygons.features.forEach((feature, index) => {
    const site = findSiteForPolygonFeature(feature, uniqueSites, index);
    if (!site || site.role !== "visible" || !site.raColor || !site.tooltip) {
      return;
    }

    const rawRing = extractPolygonRing(feature);
    if (!rawRing) {
      return;
    }

    const ring = selectDrawableTerritoryRing(
      rawRing,
      site.longitude,
      site.latitude,
    );
    if (!ring) {
      return;
    }

    rings.push({
      id: site.id,
      ring,
      raColor: site.raColor,
      tooltip: site.tooltip,
    });
  });

  return rings;
}

function clipPolygonToHalfPlane(
  polygon: [number, number][],
  isInside: (point: [number, number]) => boolean,
  intersect: (
    start: [number, number],
    end: [number, number],
  ) => [number, number],
): [number, number][] {
  if (polygon.length === 0) {
    return [];
  }

  const output: [number, number][] = [];

  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const previous = polygon[(index + polygon.length - 1) % polygon.length];
    const currentInside = isInside(current);
    const previousInside = isInside(previous);

    if (currentInside) {
      if (!previousInside) {
        output.push(intersect(previous, current));
      }
      output.push(current);
    } else if (previousInside) {
      output.push(intersect(previous, current));
    }
  }

  return output;
}

function intersectWithVerticalLine(
  start: [number, number],
  end: [number, number],
  longitude: number,
): [number, number] {
  const [startLng, startLat] = start;
  const [endLng, endLat] = end;
  const deltaLng = endLng - startLng;

  if (Math.abs(deltaLng) < 1e-12) {
    return [longitude, startLat];
  }

  const ratio = (longitude - startLng) / deltaLng;
  return [longitude, startLat + ratio * (endLat - startLat)];
}

function intersectWithHorizontalLine(
  start: [number, number],
  end: [number, number],
  latitude: number,
): [number, number] {
  const [startLng, startLat] = start;
  const [endLng, endLat] = end;
  const deltaLat = endLat - startLat;

  if (Math.abs(deltaLat) < 1e-12) {
    return [startLng, latitude];
  }

  const ratio = (latitude - startLat) / deltaLat;
  return [startLng + ratio * (endLng - startLng), latitude];
}

export function clipRingToViewport(
  ring: [number, number][],
  viewport: ViewportBounds,
): [number, number][] | null {
  let polygon = ring;

  polygon = clipPolygonToHalfPlane(
    polygon,
    ([longitude]) => longitude >= viewport.minLongitude,
    (start, end) =>
      intersectWithVerticalLine(start, end, viewport.minLongitude),
  );
  polygon = clipPolygonToHalfPlane(
    polygon,
    ([longitude]) => longitude <= viewport.maxLongitude,
    (start, end) =>
      intersectWithVerticalLine(start, end, viewport.maxLongitude),
  );
  polygon = clipPolygonToHalfPlane(
    polygon,
    ([, latitude]) => latitude >= viewport.minLatitude,
    (start, end) =>
      intersectWithHorizontalLine(start, end, viewport.minLatitude),
  );
  polygon = clipPolygonToHalfPlane(
    polygon,
    ([, latitude]) => latitude <= viewport.maxLatitude,
    (start, end) =>
      intersectWithHorizontalLine(start, end, viewport.maxLatitude),
  );

  return polygon.length >= 3 ? polygon : null;
}

export interface ClippedTerritoryPolygon {
  id: string;
  coordinates: [number, number][];
  raColor: string;
  tooltip: string;
}

export function clipTerritoryRingsToViewport(
  rings: TerritoryRing[],
  viewport: ViewportBounds,
): ClippedTerritoryPolygon[] {
  const clippedPolygons: ClippedTerritoryPolygon[] = [];

  rings.forEach((territoryRing) => {
    const clippedRing = clipRingToViewport(territoryRing.ring, viewport);
    if (!clippedRing) {
      return;
    }

    clippedPolygons.push({
      id: territoryRing.id,
      coordinates: clippedRing.map(
        ([longitude, latitude]) => [latitude, longitude] as [number, number],
      ),
      raColor: territoryRing.raColor,
      tooltip: territoryRing.tooltip,
    });
  });

  return clippedPolygons;
}

export class VoronoiTerritoryCache {
  private fingerprint: string | null = null;

  private rings: TerritoryRing[] = [];

  getRings(sites: VoronoiSite[], geoVoronoiFn: GeoVoronoiFn): TerritoryRing[] {
    const nextFingerprint = fingerprintVoronoiSites(sites);
    if (nextFingerprint !== this.fingerprint) {
      this.rings = computeVisibleTerritoryRings(sites, geoVoronoiFn);
      this.fingerprint = nextFingerprint;
    }

    return this.rings;
  }

  clear(): void {
    this.fingerprint = null;
    this.rings = [];
  }
}

export function viewportFromLeafletBounds(
  bounds: L.LatLngBounds,
): ViewportBounds {
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();

  return {
    minLongitude: southWest.lng,
    maxLongitude: northEast.lng,
    minLatitude: southWest.lat,
    maxLatitude: northEast.lat,
  };
}
