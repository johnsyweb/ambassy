/**
 * Place geocoding via Photon (OpenStreetMap data).
 * All outbound requests share one queue (1 req/s) and an in-memory cache.
 */

import {
  createCoordinate,
  getLatitude,
  getLongitude,
} from "@models/Coordinate";
import type { Coordinate } from "@models/Coordinate";

const PHOTON_API_URL = "https://photon.komoot.io/api/";
export const PLACE_SEARCH_MIN_QUERY_LENGTH = 3;
export const PLACE_SEARCH_MAX_RESULTS = 5;
export const MIN_PHOTON_REQUEST_INTERVAL_MS = 1000;
export const EMPTY_RESULT_CACHE_TTL_MS = 5 * 60 * 1000;

export const PLACE_GEOCODING_UNAVAILABLE_MESSAGE =
  "Place search is temporarily unavailable — try again in a moment or enter coordinates manually.";

export const PLACE_GEOCODING_UNAVAILABLE_SHORT_MESSAGE =
  "Place search is temporarily unavailable — try again in a moment.";

export interface PlaceSearchResult {
  label: string;
  latitude: number;
  longitude: number;
}

export class PlaceGeocodingUnavailableError extends Error {
  constructor(message = PLACE_GEOCODING_UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "PlaceGeocodingUnavailableError";
  }
}

interface PhotonFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: Record<string, string | undefined>;
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

type CacheEntry =
  | { kind: "success"; results: PlaceSearchResult[]; cachedAt: number }
  | { kind: "empty"; cachedAt: number };

const placeSearchCache = new Map<string, CacheEntry>();
let lastPhotonRequestAt = 0;
let photonRequestQueue: Promise<unknown> = Promise.resolve();

export function clearPlaceGeocodingCache(): void {
  placeSearchCache.clear();
  lastPhotonRequestAt = 0;
}

export function normalizePlaceSearchQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

function formatPhotonLabel(properties: Record<string, string | undefined>): string {
  const parts: string[] = [];
  const seen = new Set<string>();

  for (const key of ["name", "street", "city", "state", "country"]) {
    const value = properties[key]?.trim();
    if (!value || seen.has(value.toLowerCase())) {
      continue;
    }
    seen.add(value.toLowerCase());
    parts.push(value);
  }

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return "Unknown place";
}

function parsePhotonFeature(feature: PhotonFeature): PlaceSearchResult | null {
  const coordinates = feature.geometry?.coordinates;
  if (!coordinates || coordinates.length !== 2) {
    return null;
  }

  const [longitude, latitude] = coordinates;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  try {
    const coord = createCoordinate(latitude, longitude);
    return {
      label: formatPhotonLabel(feature.properties ?? {}),
      latitude: getLatitude(coord),
      longitude: getLongitude(coord),
    };
  } catch {
    return null;
  }
}

function getCachedResults(normalizedQuery: string): PlaceSearchResult[] | null {
  const entry = placeSearchCache.get(normalizedQuery);
  if (!entry) {
    return null;
  }

  if (entry.kind === "success") {
    return entry.results;
  }

  if (Date.now() - entry.cachedAt < EMPTY_RESULT_CACHE_TTL_MS) {
    return [];
  }

  placeSearchCache.delete(normalizedQuery);
  return null;
}

function cacheResults(
  normalizedQuery: string,
  results: PlaceSearchResult[],
): void {
  if (results.length === 0) {
    placeSearchCache.set(normalizedQuery, {
      kind: "empty",
      cachedAt: Date.now(),
    });
    return;
  }

  placeSearchCache.set(normalizedQuery, {
    kind: "success",
    results,
    cachedAt: Date.now(),
  });
}

async function waitForPhotonSlot(): Promise<void> {
  const now = Date.now();
  const waitMs = Math.max(0, MIN_PHOTON_REQUEST_INTERVAL_MS - (now - lastPhotonRequestAt));
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  lastPhotonRequestAt = Date.now();
}

async function runQueuedPhotonRequest<T>(operation: () => Promise<T>): Promise<T> {
  const task = photonRequestQueue.then(async () => {
    await waitForPhotonSlot();
    return operation();
  });
  photonRequestQueue = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

async function fetchPhotonFeatures(
  query: string,
  limit: number,
): Promise<PlaceSearchResult[]> {
  const normalizedQuery = normalizePlaceSearchQuery(query);
  const cached = getCachedResults(normalizedQuery);
  if (cached !== null) {
    return cached.slice(0, limit);
  }

  return runQueuedPhotonRequest(async () => {
    const cachedAfterQueue = getCachedResults(normalizedQuery);
    if (cachedAfterQueue !== null) {
      return cachedAfterQueue.slice(0, limit);
    }

    const url = `${PHOTON_API_URL}?q=${encodeURIComponent(query.trim())}&limit=${limit}`;
    let response: Response;

    try {
      response = await fetch(url);
    } catch {
      throw new PlaceGeocodingUnavailableError();
    }

    if (response.status === 429) {
      throw new PlaceGeocodingUnavailableError();
    }

    if (!response.ok) {
      throw new PlaceGeocodingUnavailableError(
        `Place search returned ${response.status}`,
      );
    }

    const data = (await response.json()) as PhotonResponse;
    const results = (data.features ?? [])
      .map((feature) => parsePhotonFeature(feature))
      .filter((result): result is PlaceSearchResult => result !== null);

    cacheResults(normalizedQuery, results);
    return results.slice(0, limit);
  });
}

export async function searchPlaces(
  query: string,
): Promise<PlaceSearchResult[]> {
  if (query.trim().length < PLACE_SEARCH_MIN_QUERY_LENGTH) {
    return [];
  }

  try {
    return await fetchPhotonFeatures(query, PLACE_SEARCH_MAX_RESULTS);
  } catch (error) {
    if (error instanceof PlaceGeocodingUnavailableError) {
      throw error;
    }
    throw new PlaceGeocodingUnavailableError();
  }
}

/**
 * Geocodes an address to latitude and longitude coordinates.
 * Coordinate strings in "lat,lng" format are parsed locally without a network call.
 */
export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number }> {
  if (!address || address.trim().length === 0) {
    throw new Error("Address cannot be empty");
  }

  if (isCoordinateFormat(address.trim())) {
    const coords = parseCoordinates(address.trim());
    if (coords) {
      return coords;
    }
  }

  const results = await fetchPhotonFeatures(address, 1);
  if (results.length === 0) {
    throw new Error("No geocoding results found for address");
  }

  return { lat: results[0].latitude, lng: results[0].longitude };
}

export async function geocodeAddressWithResult(address: string): Promise<{
  success: boolean;
  coordinates?: Coordinate;
  error?: string;
}> {
  try {
    const { lat, lng } = await geocodeAddress(address);
    return {
      success: true,
      coordinates: createCoordinate(lat, lng),
    };
  } catch (error) {
    if (error instanceof PlaceGeocodingUnavailableError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Geocoding request failed",
    };
  }
}

export async function geocodeProspectiveEvent(
  prospectEvent: string,
  country: string,
  state: string,
): Promise<{
  success: boolean;
  coordinates?: Coordinate;
  error?: string;
}> {
  const query = `${prospectEvent}, ${state}, ${country}`;
  return geocodeAddressWithResult(query);
}

function isCoordinateFormat(input: string): boolean {
  return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(input);
}

function parseCoordinates(input: string): { lat: number; lng: number } | null {
  const parts = input.split(",").map((part) => parseFloat(part.trim()));

  if (parts.length !== 2 || parts.some(Number.isNaN)) {
    return null;
  }

  const [lat, lng] = parts;

  try {
    const coord = createCoordinate(lat, lng);
    return { lat: getLatitude(coord), lng: getLongitude(coord) };
  } catch {
    return null;
  }
}
