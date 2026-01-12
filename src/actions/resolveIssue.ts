import { EventIssue } from "@models/EventIssue";
import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";
import { geocodeAddress } from "../utils/geocoding";

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

  const longitude = eventDetails.geometry.coordinates[0];
  const latitude = eventDetails.geometry.coordinates[1];

  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
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
  const [longitude, latitude] = coordinates;

  if (
    typeof longitude !== "number" ||
    typeof latitude !== "number" ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error("Invalid coordinates");
  }

  const eventDetails: EventDetails & { manualCoordinates?: boolean } = {
    id: `manual-${issue.eventShortName}`,
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [longitude, latitude],
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
    newValue: `Manual pin placement: (${latitude}, ${longitude})`,
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
        countrycode: extractedMetadata.countrycode || 13, // Default to Australia
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
  const urlMatch = url.match(/https?:\/\/(?:www\.)?parkrun\.([^\/]+)\/([^\/]+)\/?/);
  if (!urlMatch) {
    throw new Error('Invalid parkrun URL format');
  }

  const [, domain, eventSlug] = urlMatch;

  // Map domain to country code
  const domainToCountry: Record<string, number> = {
    'com.au': 13,  // Australia
    'co.uk': 1,    // United Kingdom
    'com': 2,      // United States
    'ca': 3,       // Canada
    'co.za': 4,    // South Africa
    'de': 5,       // Germany
    'fr': 6,       // France
    'it': 7,       // Italy
    'co.nz': 8,    // New Zealand
    'pl': 9,       // Poland
    'se': 10,      // Sweden
    'no': 11,      // Norway
    'dk': 12,      // Denmark
    'ie': 14,      // Ireland
    'fi': 15,      // Finland
    'nl': 16,      // Netherlands
    'sg': 17,      // Singapore
    'my': 18,      // Malaysia
    'jp': 19,      // Japan
  };

  const countrycode = domainToCountry[domain] || 13; // Default to Australia

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
  } catch (error) {
    // Use fallback name generation
    console.warn('Could not fetch page title, using generated name');
  }

  return {
    EventLongName,
    countrycode,
    seriesid,
  };
}
