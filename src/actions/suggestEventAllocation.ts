import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { calculateGeographicProximityScore, findNeighboringEvents } from "./suggestReallocation";
import { loadCapacityLimits } from "./checkCapacity";
import { getRegionalAmbassadorForEventAmbassador } from "@utils/regions";

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
