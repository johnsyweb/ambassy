import { EventIssue } from "@models/EventIssue";
import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";

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
