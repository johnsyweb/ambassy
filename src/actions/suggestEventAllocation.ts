import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventDetails } from "@models/EventDetails";
import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { Coordinate, toGeoJSONArray } from "@models/Coordinate";
import { calculateGeographicProximityScore, findNeighboringEvents } from "./suggestReallocation";
import { loadCapacityLimits } from "./checkCapacity";
import { getRegionalAmbassadorForEventAmbassador } from "@utils/regions";
import { getCountryCodeFromCoordinate } from "@models/country";

/**
 * Generate allocation suggestions for an unallocated event.
 * Prioritizes EAs with fewer allocations and geographic proximity.
 */
export function suggestEventAllocation(
  eventName: string,
  eventAmbassadors: EventAmbassadorMap,
  eventDetails: EventDetailsMap,
  regionalAmbassadors: RegionalAmbassadorMap
): ReallocationSuggestion[] {
  if (!eventDetails.has(eventName)) {
    throw new Error(`Event "${eventName}" not found in eventDetails`);
  }

  if (eventAmbassadors.size === 0) {
    return [];
  }

  const limits = loadCapacityLimits();
  const suggestions: ReallocationSuggestion[] = [];
  const event = eventDetails.get(eventName);
  const eventCoords = event?.geometry?.coordinates;

  eventAmbassadors.forEach((recipient, recipientName) => {
    const liveEventsCount = recipient.events.length;
    const prospectEventsCount = recipient.prospectiveEvents?.length ?? 0;
    const totalAllocations = liveEventsCount + prospectEventsCount;

    const reasons: string[] = [];
    const warnings: string[] = [];

    if (recipient.events.length < limits.eventAmbassadorMin) {
      reasons.push("Under capacity");
    } else if (recipient.events.length + 1 <= limits.eventAmbassadorMax) {
      reasons.push("Has available capacity");
    } else {
      warnings.push("Would exceed capacity limit");
    }

    let score = 0;
    let neighboringEvents: Array<{ name: string; distanceKm: number }> = [];

    if (eventCoords && recipient.events.length > 0) {
      const proximityScore = calculateGeographicProximityScore(
        recipient.events,
        [eventName],
        eventDetails
      );
      neighboringEvents = findNeighboringEvents(recipient.events, [eventName], eventDetails, 50);

      if (proximityScore > 50) {
        reasons.push("Geographic proximity");
      }

      if (neighboringEvents.length > 0) {
        const eventList = neighboringEvents
          .map((e) => `${e.name} (${e.distanceKm.toFixed(1)}km)`)
          .join(", ");
        reasons.push(`Nearby events: ${eventList}`);
      }
    }

    const baseScore = Math.max(0, 1000 - totalAllocations * 10);

    let distanceBonus = 0;
    if (neighboringEvents.length > 0) {
      const closestDistance = neighboringEvents[0].distanceKm;
      distanceBonus = Math.max(0, 100 - closestDistance);
    }

    score = baseScore + distanceBonus;

    if (recipient.events.length + 1 > limits.eventAmbassadorMax) {
      warnings.push(`Would exceed maximum capacity (${limits.eventAmbassadorMax})`);
    }

    const recipientRA = getRegionalAmbassadorForEventAmbassador(
      recipientName,
      regionalAmbassadors
    );
    if (recipientRA) {
      reasons.push(`REA: ${recipientRA}`);
    }

    suggestions.push({
      fromAmbassador: "",
      toAmbassador: recipientName,
      items: [eventName],
      score,
      reasons: reasons.length > 0 ? reasons : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      allocationCount: totalAllocations,
      liveEventsCount,
      prospectEventsCount,
      neighboringEvents: neighboringEvents.length > 0 ? neighboringEvents : undefined,
    });
  });

  return suggestions.sort((a, b) => b.score - a.score);
}

/**
 * Generate EA allocation suggestions for a prospect based on coordinates.
 * Creates a temporary EventDetails entry to reuse existing allocation algorithm.
 * 
 * @param prospectName - Prospect name (used for temporary EventDetails entry)
 * @param coordinates - Prospect coordinates
 * @param eventAmbassadors - All EAs for suggestions
 * @param eventDetails - Event details map (used for creating temporary entry)
 * @param regionalAmbassadors - All REAs for REA inference
 * @returns Sorted suggestions (highest score first)
 */
export async function generateProspectAllocationSuggestions(
  prospectName: string,
  coordinates: Coordinate,
  eventAmbassadors: EventAmbassadorMap,
  eventDetails: EventDetailsMap,
  regionalAmbassadors: RegionalAmbassadorMap
): Promise<ReallocationSuggestion[]> {
  if (eventAmbassadors.size === 0) {
    return [];
  }

  // Create temporary EventDetails entry for prospect
  const countryCode = await getCountryCodeFromCoordinate(coordinates);
  const tempEventName = `prospect-${prospectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  
  const tempEventDetails: EventDetails = {
    id: tempEventName,
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: toGeoJSONArray(coordinates), // GeoJSON format: [longitude, latitude]
    },
    properties: {
      eventname: prospectName.toLowerCase().replace(/\s+/g, ''),
      EventLongName: prospectName,
      EventShortName: prospectName,
      LocalisedEventLongName: null,
      countrycode: countryCode,
      seriesid: 1, // Default to 5km
      EventLocation: "",
    },
  };

  // Add temporary entry to map
  eventDetails.set(tempEventName, tempEventDetails);

  try {
    // Generate suggestions using existing algorithm
    const suggestions = suggestEventAllocation(
      tempEventName,
      eventAmbassadors,
      eventDetails,
      regionalAmbassadors
    );

    return suggestions;
  } finally {
    // Clean up temporary entry
    eventDetails.delete(tempEventName);
  }
}
