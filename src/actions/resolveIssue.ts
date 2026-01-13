import { EventIssue } from "@models/EventIssue";
import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";
import { geocodeAddress } from "../utils/geocoding";
import { fromGeoJSONArray, formatCoordinate, toGeoJSONArray, createCoordinate } from "../models/Coordinate";
import { getCountryCodeFromCoordinate, getCountryCodeFromDomain } from "../models/country";

export function resolveIssueWithEvent(
  issue: EventIssue,
  eventDetails: EventDetails,
  eventDetailsMap: EventDetailsMap,
  log: LogEntry[]
): void {
  if (
    !eventDetails.geometry?.coordinates ||
    eventDetails.geometry.coordinates.length !== 2 ||
    typeof eventDetails.geometry.coordinates[0] !== "number" ||
    typeof eventDetails.geometry.coordinates[1] !== "number"
  ) {
    throw new Error("Event details must have valid coordinates");
  }

  // Validation handled by fromGeoJSONArray (ONLY place for coordinate validation)
  try {
    fromGeoJSONArray(eventDetails.geometry.coordinates);
  } catch {
    throw new Error("Event details must have valid coordinates");
  }

  const eventToAdd: EventDetails = {
    ...eventDetails,
    properties: {
      ...eventDetails.properties,
      EventShortName: issue.eventShortName,
    },
  };

  eventDetailsMap.set(issue.eventShortName, eventToAdd);

  const logEntry: LogEntry = {
    type: "Issue Resolved",
    event: issue.eventShortName,
    oldValue: "Missing coordinates",
    newValue: `Found in events.json: ${eventDetails.properties.EventLongName || eventDetails.properties.EventShortName} (${eventDetails.geometry.coordinates[1]}, ${eventDetails.geometry.coordinates[0]})`,
    timestamp: Date.now(),
  };

  log.push(logEntry);
}

export function resolveIssueWithPin(
  issue: EventIssue,
  coordinates: [number, number],
  eventDetailsMap: EventDetailsMap,
  log: LogEntry[]
): void {
  // Validation handled by fromGeoJSONArray (ONLY place for coordinate validation)
  let coord;
  try {
    coord = fromGeoJSONArray(coordinates);
  } catch {
    throw new Error("Invalid coordinates");
  }

  const eventDetails: EventDetails & { manualCoordinates?: boolean } = {
    id: `manual-${issue.eventShortName}`,
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: toGeoJSONArray(coord),
    },
    properties: {
      eventname: issue.eventShortName,
      EventLongName: issue.eventShortName,
      EventShortName: issue.eventShortName,
      LocalisedEventLongName: null,
      countrycode: 0,
      seriesid: 0,
      EventLocation: "",
    },
    manualCoordinates: true,
  };

  eventDetailsMap.set(issue.eventShortName, eventDetails);

  const logEntry: LogEntry = {
    type: "Issue Resolved",
    event: issue.eventShortName,
    oldValue: "Missing coordinates",
    newValue: `Manual pin placement: ${formatCoordinate(coord)}`,
    timestamp: Date.now(),
  };

  log.push(logEntry);
}

export async function resolveIssueWithAddress(
  issue: EventIssue,
  address: string,
  eventDetailsMap: EventDetailsMap,
  log: LogEntry[],
  parkrunUrl?: string
): Promise<void> {
  try {
    const { lat, lng } = await geocodeAddress(address);

    // Extract additional metadata from URL if provided
    let extractedMetadata: Partial<{
      EventLongName: string;
      countrycode: number;
      seriesid: number;
    }> = {};

    if (parkrunUrl) {
      try {
        extractedMetadata = await extractMetadataFromUrl(parkrunUrl);
      } catch (urlError) {
        console.warn(`Failed to extract metadata from URL ${parkrunUrl}:`, urlError);
        // Continue without URL metadata
      }
    }

    const eventDetails: EventDetails & {
      geocodedAddress?: boolean;
      sourceAddress?: string;
      sourceUrl?: string;
    } = {
      id: `geocoded-${issue.eventShortName}`,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON uses [longitude, latitude]
      },
      properties: {
        eventname: extractedMetadata.EventLongName || issue.eventShortName,
        EventLongName: extractedMetadata.EventLongName || issue.eventShortName,
        EventShortName: issue.eventShortName,
        LocalisedEventLongName: null,
        countrycode: extractedMetadata.countrycode || await getCountryCodeFromCoordinate(createCoordinate(lat, lng)) || 0,
        seriesid: extractedMetadata.seriesid || 1, // Default to 5km
        EventLocation: "",
      },
      geocodedAddress: true,
      sourceAddress: address,
      sourceUrl: parkrunUrl,
    };

    eventDetailsMap.set(issue.eventShortName, eventDetails);

    const logEntry: LogEntry = {
      type: "Issue Resolved",
      event: issue.eventShortName,
      oldValue: "Missing coordinates",
      newValue: parkrunUrl
        ? `Geocoded address: "${address}" (${lat}, ${lng}) with metadata from ${parkrunUrl}`
        : `Geocoded address: "${address}" (${lat}, ${lng})`,
      timestamp: Date.now(),
    };

    log.push(logEntry);
  } catch (error) {
    throw new Error(`Failed to geocode address "${address}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts metadata from a parkrun URL
 */
async function extractMetadataFromUrl(url: string): Promise<{
  EventLongName: string;
  countrycode: number;
  seriesid: number;
}> {
  // Parse URL to extract components
  const urlMatch = url.match(/https?:\/\/(?:www\.)?parkrun\.([^/]+)\/([^/]+)\/?/);
  if (!urlMatch) {
    throw new Error('Invalid parkrun URL format');
  }

  const [, domain, eventSlug] = urlMatch;

  // Look up country code from domain dynamically
  const countrycode = await getCountryCodeFromDomain(domain) || 0;

  // Determine series (5km vs juniors)
  const seriesid = eventSlug.endsWith('-juniors') ? 2 : 1; // 1 = 5km, 2 = juniors

  // Try to fetch the page title for the full event name
  let EventLongName = `${eventSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} parkrun`;

  try {
    // Note: In a real implementation, you'd need to handle CORS or use a backend service
    // For now, we'll generate a reasonable name from the URL slug
    EventLongName = eventSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/Juniors?$/, 'juniors') + ' parkrun';
  } catch {
    // Use fallback name generation
    console.warn('Could not fetch page title, using generated name');
  }

  return {
    EventLongName,
    countrycode,
    seriesid,
  };
}
