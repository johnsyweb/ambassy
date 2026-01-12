import { EventIssue } from "@models/EventIssue";
import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";

export function resolveIssueWithEvent(
  issue: EventIssue,
  eventDetails: EventDetails,
  eventDetailsMap: EventDetailsMap
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
}

export function resolveIssueWithPin(
  issue: EventIssue,
  coordinates: [number, number],
  eventDetailsMap: EventDetailsMap
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
}
