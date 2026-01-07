import { EventAmbassadorMap } from "../models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";
import { EventDetailsMap } from "../models/EventDetailsMap";
import { CapacityLimits } from "../models/CapacityLimits";
import { ReallocationSuggestion } from "../models/ReallocationSuggestion";
import { EventAmbassador } from "../models/EventAmbassador";
import { RegionalAmbassador } from "../models/RegionalAmbassador";
import { calculateDistance, calculateAverageDistance } from "../utils/geography";
import { Region } from "../models/Region";
import { checkEventAmbassadorCapacity, checkRegionalAmbassadorCapacity } from "./checkCapacity";
import { CapacityStatus } from "../models/CapacityStatus";

export interface ReallocationOptions {
  fromRegion?: Region;
  conflicts?: string[];
}

const CAPACITY_WEIGHT = 0.3;
const REGION_WEIGHT = 0.3;
const PROXIMITY_WEIGHT = 0.3;
const CONFLICT_PENALTY = -100;

/**
 * Calculate geographic proximity score based on average distance.
 * Higher score = closer events.
 */
export function calculateGeographicProximityScore(
  recipientEvents: string[],
  reallocatingEvents: string[],
  eventDetails: EventDetailsMap
): number {
  if (recipientEvents.length === 0) {
    return 0; // No baseline for proximity
  }

  const recipientCoords: Array<[number, number]> = [];
  const reallocatingCoords: Array<[number, number]> = [];

  // Get coordinates for recipient's events
  for (const eventName of recipientEvents) {
    const details = eventDetails.get(eventName);
    if (details?.geometry?.coordinates) {
      const [lon, lat] = details.geometry.coordinates;
      recipientCoords.push([lat, lon]);
    }
  }

  // Get coordinates for events being reallocated
  for (const eventName of reallocatingEvents) {
    const details = eventDetails.get(eventName);
    if (details?.geometry?.coordinates) {
      const [lon, lat] = details.geometry.coordinates;
      reallocatingCoords.push([lat, lon]);
    }
  }

  if (recipientCoords.length === 0 || reallocatingCoords.length === 0) {
    return 0; // Missing coordinates
  }

  // Calculate average distance from each reallocating event to recipient's events
  const distances: number[] = [];
  for (const [reallocLat, reallocLon] of reallocatingCoords) {
    const avgDist = calculateAverageDistance(reallocLat, reallocLon, recipientCoords);
    if (avgDist !== null) {
      distances.push(avgDist);
    }
  }

  if (distances.length === 0) {
    return 0;
  }

  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  // Convert distance to score (closer = higher score)
  // Max score for 0km, decreasing to 0 for 500km+
  // Using inverse relationship: score = 100 * (1 - min(avgDistance / 500, 1))
  const maxDistance = 500; // km
  const normalizedDistance = Math.min(avgDistance / maxDistance, 1);
  return Math.max(0, 100 * (1 - normalizedDistance));
}

/**
 * Calculate reallocation score for a recipient ambassador.
 * Higher score = better match.
 */
export function calculateReallocationScore(
  recipient: EventAmbassador | RegionalAmbassador,
  items: string[],
  itemType: "events" | "eventAmbassadors",
  eventDetails: EventDetailsMap,
  limits: CapacityLimits,
  options?: ReallocationOptions
): number {
  let score = 0;

  // Check for conflicts
  if (recipient.conflicts && recipient.conflicts.length > 0) {
    const hasConflict = items.some((item) => recipient.conflicts?.includes(item));
    if (hasConflict) {
      return CONFLICT_PENALTY; // Heavy penalty for conflicts
    }
  }

  // Capacity factor
  let capacityScore = 0;
  if (itemType === "events" && "events" in recipient) {
    const currentCount = recipient.events.length;
    const newCount = currentCount + items.length;
    const status = checkEventAmbassadorCapacity(newCount, limits);
    
    if (status === CapacityStatus.WITHIN) {
      const availableCapacity = limits.eventAmbassadorMax - currentCount;
      capacityScore = Math.min(100, (availableCapacity / limits.eventAmbassadorMax) * 100);
    } else if (status === CapacityStatus.UNDER) {
      capacityScore = 50; // Moderate score for under capacity
    } else {
      capacityScore = 10; // Low score for over capacity (but still suggested)
    }
  } else if (itemType === "eventAmbassadors" && "supportsEAs" in recipient) {
    const currentCount = recipient.supportsEAs.length;
    const newCount = currentCount + items.length;
    const status = checkRegionalAmbassadorCapacity(newCount, limits);
    
    if (status === CapacityStatus.WITHIN) {
      const availableCapacity = limits.regionalAmbassadorMax - currentCount;
      capacityScore = Math.min(100, (availableCapacity / limits.regionalAmbassadorMax) * 100);
    } else if (status === CapacityStatus.UNDER) {
      capacityScore = 50;
    } else {
      capacityScore = 10;
    }
  }

  score += capacityScore * CAPACITY_WEIGHT;

  // Region factor
  if (options?.fromRegion && recipient.region) {
    if (recipient.region === options.fromRegion) {
      score += 100 * REGION_WEIGHT; // Full score for same region
    } else if (recipient.region !== Region.UNKNOWN) {
      score += 30 * REGION_WEIGHT; // Partial score for different region
    }
  } else if (recipient.region && recipient.region !== Region.UNKNOWN) {
    score += 50 * REGION_WEIGHT; // Moderate score if region is set but no fromRegion specified
  }

  // Proximity factor (only for events)
  if (itemType === "events" && "events" in recipient) {
    const proximityScore = calculateGeographicProximityScore(
      recipient.events,
      items,
      eventDetails
    );
    score += proximityScore * PROXIMITY_WEIGHT;
  }

  return Math.max(0, Math.min(100, score)); // Clamp to 0-100
}

/**
 * Generate reallocation suggestions for events when offboarding an Event Ambassador.
 */
export function suggestEventReallocation(
  fromAmbassador: string,
  events: string[],
  eventAmbassadors: EventAmbassadorMap,
  eventDetails: EventDetailsMap,
  limits: CapacityLimits,
  options?: ReallocationOptions
): ReallocationSuggestion[] {
  if (!eventAmbassadors.has(fromAmbassador)) {
    throw new Error(`Event Ambassador "${fromAmbassador}" not found`);
  }

  if (events.length === 0) {
    throw new Error("Events array cannot be empty");
  }

  const fromEA = eventAmbassadors.get(fromAmbassador)!;
  const suggestions: ReallocationSuggestion[] = [];

  // Generate suggestions for each potential recipient
  eventAmbassadors.forEach((recipient, recipientName) => {
    if (recipientName === fromAmbassador) {
      return; // Skip the ambassador being offboarded
    }

    const score = calculateReallocationScore(
      recipient,
      events,
      "events",
      eventDetails,
      limits,
      { ...options, fromRegion: fromEA.region }
    );

    if (score < 0) {
      return; // Skip conflicts
    }

    const reasons: string[] = [];
    const warnings: string[] = [];

    // Add reasons
    if (recipient.region === fromEA.region && recipient.region !== Region.UNKNOWN) {
      reasons.push("Same region");
    }
    if (recipient.events.length < limits.eventAmbassadorMin) {
      reasons.push("Under capacity");
    } else if (recipient.events.length + events.length <= limits.eventAmbassadorMax) {
      reasons.push("Has available capacity");
    } else {
      warnings.push("Would exceed capacity limit");
    }

    const proximityScore = calculateGeographicProximityScore(recipient.events, events, eventDetails);
    if (proximityScore > 50) {
      reasons.push("Geographic proximity");
    }

    // Add warnings
    if (recipient.events.length + events.length > limits.eventAmbassadorMax) {
      warnings.push(`Would exceed maximum capacity (${limits.eventAmbassadorMax})`);
    }

    suggestions.push({
      fromAmbassador,
      toAmbassador: recipientName,
      items: events,
      score,
      reasons: reasons.length > 0 ? reasons : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  });

  // Sort by score (highest first)
  return suggestions.sort((a, b) => b.score - a.score);
}

/**
 * Generate reallocation suggestions for Event Ambassadors when offboarding a Regional Ambassador.
 */
export function suggestEventAmbassadorReallocation(
  fromAmbassador: string,
  eventAmbassadorNames: string[],
  regionalAmbassadors: RegionalAmbassadorMap,
  eventAmbassadors: EventAmbassadorMap,
  limits: CapacityLimits,
  options?: ReallocationOptions
): ReallocationSuggestion[] {
  if (!regionalAmbassadors.has(fromAmbassador)) {
    throw new Error(`Regional Ambassador "${fromAmbassador}" not found`);
  }

  if (eventAmbassadorNames.length === 0) {
    throw new Error("Event Ambassadors array cannot be empty");
  }

  const fromREA = regionalAmbassadors.get(fromAmbassador)!;
  const suggestions: ReallocationSuggestion[] = [];

  // Generate suggestions for each potential recipient
  regionalAmbassadors.forEach((recipient, recipientName) => {
    if (recipientName === fromAmbassador) {
      return; // Skip the ambassador being offboarded
    }

    // Create a dummy EventDetailsMap for scoring (not needed for EA reallocation)
    const dummyEventDetails: EventDetailsMap = new Map();

    const score = calculateReallocationScore(
      recipient,
      eventAmbassadorNames,
      "eventAmbassadors",
      dummyEventDetails,
      limits,
      { ...options, fromRegion: fromREA.region }
    );

    if (score < 0) {
      return; // Skip conflicts
    }

    const reasons: string[] = [];
    const warnings: string[] = [];

    // Add reasons
    if (recipient.region === fromREA.region && recipient.region !== Region.UNKNOWN) {
      reasons.push("Same region");
    }
    if (recipient.supportsEAs.length < limits.regionalAmbassadorMin) {
      reasons.push("Under capacity");
    } else if (recipient.supportsEAs.length + eventAmbassadorNames.length <= limits.regionalAmbassadorMax) {
      reasons.push("Has available capacity");
    } else {
      warnings.push("Would exceed capacity limit");
    }

    // Add warnings
    if (recipient.supportsEAs.length + eventAmbassadorNames.length > limits.regionalAmbassadorMax) {
      warnings.push(`Would exceed maximum capacity (${limits.regionalAmbassadorMax})`);
    }

    suggestions.push({
      fromAmbassador,
      toAmbassador: recipientName,
      items: eventAmbassadorNames,
      score,
      reasons: reasons.length > 0 ? reasons : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  });

  // Sort by score (highest first)
  return suggestions.sort((a, b) => b.score - a.score);
}

