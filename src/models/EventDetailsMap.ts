import { EventDetails, eventDetailsToCoordinate, coordinateToEventDetailsGeometry } from "@models/EventDetails";

export type EventDetailsMap = Map<string, EventDetails>;

// Re-export coordinate conversion functions for convenience
export { eventDetailsToCoordinate, coordinateToEventDetailsGeometry };
