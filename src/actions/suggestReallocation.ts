import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { CapacityLimits } from "@models/CapacityLimits";
import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { EventAmbassador } from "@models/EventAmbassador";
import { RegionalAmbassador } from "@models/RegionalAmbassador";
import { calculateAverageDistance, calculateDistance } from "@utils/geography";
import { checkEventAmbassadorCapacity, checkRegionalAmbassadorCapacity } from "./checkCapacity";
import { CapacityStatus } from "@models/CapacityStatus";
import { getRegionalAmbassadorForEventAmbassador } from "@utils/regions";

export interface ReallocationOptions {
  fromRegionalAmbassador?: string;
  conflicts?: string[];
}

const CAPACITY_WEIGHT = 0.3;
const REGION_WEIGHT = 0.3;
const PROXIMITY_WEIGHT = 0.3;
const CONFLICT_PENALTY = -100;
const ZERO_ALLOCATIONS_BONUS = 1000; // Very high bonus for 0 allocations

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
 * Find neighboring events within a distance threshold.
 * Returns array of neighboring events with their distances.
 */
export function findNeighboringEvents(
  recipientEvents: string[],
  reallocatingEvents: string[],
  eventDetails: EventDetailsMap,
  thresholdKm: number = 50
): Array<{ name: string; distanceKm: number }> {
  const neighbors: Array<{ name: string; distanceKm: number }> = [];
  
  if (reallocatingEvents.length === 0 || recipientEvents.length === 0) {
    return neighbors;
  }

  // Get coordinates for reallocating events
  const reallocatingCoords: Array<{ name: string; lat: number; lon: number }> = [];
  for (const eventName of reallocatingEvents) {
    const details = eventDetails.get(eventName);
    if (details?.geometry?.coordinates) {
      const [lon, lat] = details.geometry.coordinates;
      reallocatingCoords.push({ name: eventName, lat, lon });
    }
  }

  if (reallocatingCoords.length === 0) {
    return neighbors;
  }

  // Check each recipient event to see if it's within threshold of any reallocating event
  for (const recipientEventName of recipientEvents) {
    const recipientDetails = eventDetails.get(recipientEventName);
    if (!recipientDetails?.geometry?.coordinates) {
      continue;
    }

    const [recipientLon, recipientLat] = recipientDetails.geometry.coordinates;
    
    // Find the closest reallocating event and its distance
    let closestDistance = Infinity;
    for (const realloc of reallocatingCoords) {
      const distance = calculateDistance(recipientLat, recipientLon, realloc.lat, realloc.lon);
      if (distance <= thresholdKm && distance < closestDistance) {
        closestDistance = distance;
      }
    }
    
    // Add to neighbors if within threshold
    if (closestDistance !== Infinity) {
      neighbors.push({ name: recipientEventName, distanceKm: closestDistance });
    }
  }

  // Sort by distance (closest first)
  neighbors.sort((a, b) => a.distanceKm - b.distanceKm);
  
  return neighbors;
}

/**
 * Calculate reallocation score for a recipient ambassador.
 * Higher score = better match.
 */
export function calculateReallocationScore(
  recipient: EventAmbassador | RegionalAmbassador,
  recipientName: string,
  items: string[],
  itemType: "events" | "eventAmbassadors",
  eventDetails: EventDetailsMap,
  limits: CapacityLimits,
  regionalAmbassadors: RegionalAmbassadorMap,
  options?: ReallocationOptions
): number {
  let score = 0;

  // Check for conflicts
  if (recipient.conflicts && recipient.conflicts.length > 0) {
    const hasConflict = items.some((item) => recipient.conflicts?.includes(item));
    if (hasConflict) {
      return CONFLICT_PENALTY;
    }
  }

  // Capacity factor - prioritize those with fewer allocations
  let capacityScore = 0;
  if (itemType === "events" && "events" in recipient) {
    const currentCount = recipient.events.length;
    const newCount = currentCount + items.length;
    const status = checkEventAmbassadorCapacity(newCount, limits);
    
    // Prioritize fewer allocations: lower currentCount = higher score
    // Score ranges from 0-100, with 100 for 0 allocations, decreasing as allocations increase
    const maxAllocations = limits.eventAmbassadorMax;
    const allocationScore = Math.max(0, 100 * (1 - currentCount / maxAllocations));
    
    if (status === CapacityStatus.WITHIN) {
      // Within capacity: use allocation score (fewer = better)
      capacityScore = allocationScore;
    } else if (status === CapacityStatus.UNDER) {
      // Under capacity: still prioritize fewer, but less weight
      capacityScore = allocationScore * 0.5;
    } else {
      // Over capacity: minimal score
      capacityScore = 10;
    }
  } else if (itemType === "eventAmbassadors" && "supportsEAs" in recipient) {
    const currentCount = recipient.supportsEAs.length;
    const newCount = currentCount + items.length;
    const status = checkRegionalAmbassadorCapacity(newCount, limits);
    
    // Prioritize fewer allocations
    const maxAllocations = limits.regionalAmbassadorMax;
    const allocationScore = Math.max(0, 100 * (1 - currentCount / maxAllocations));
    
    if (status === CapacityStatus.WITHIN) {
      capacityScore = allocationScore;
    } else if (status === CapacityStatus.UNDER) {
      capacityScore = allocationScore * 0.5;
    } else {
      capacityScore = 10;
    }
  }

  score += capacityScore * CAPACITY_WEIGHT;

  // Region factor (determined dynamically from supportsEAs)
  if (options?.fromRegionalAmbassador && itemType === "events" && "events" in recipient) {
    const recipientRA = getRegionalAmbassadorForEventAmbassador(recipientName, regionalAmbassadors);
    if (recipientRA === options.fromRegionalAmbassador) {
      score += 100 * REGION_WEIGHT;
    } else if (recipientRA !== null) {
      score += 30 * REGION_WEIGHT;
    }
  } else if (itemType === "events" && "events" in recipient) {
    const recipientRA = getRegionalAmbassadorForEventAmbassador(recipientName, regionalAmbassadors);
    if (recipientRA !== null) {
      score += 50 * REGION_WEIGHT;
    }
  }

  // State factor for RA-to-RA reallocations
  if (options?.fromRegionalAmbassador && itemType === "eventAmbassadors" && "state" in recipient) {
    const fromRA = regionalAmbassadors.get(options.fromRegionalAmbassador);
    if (fromRA && recipient.state === fromRA.state) {
      score += 100 * REGION_WEIGHT; // High bonus for same state
    }
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

  return Math.max(0, Math.min(100, score));
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
  regionalAmbassadors: RegionalAmbassadorMap,
  options?: ReallocationOptions
): ReallocationSuggestion[] {
  if (!eventAmbassadors.has(fromAmbassador)) {
    throw new Error(`Event Ambassador "${fromAmbassador}" not found`);
  }

  if (events.length === 0) {
    throw new Error("Events array cannot be empty");
  }

  const fromEA_RA = getRegionalAmbassadorForEventAmbassador(fromAmbassador, regionalAmbassadors);
  const suggestions: ReallocationSuggestion[] = [];

  // Generate suggestions for each potential recipient
  eventAmbassadors.forEach((recipient, recipientName) => {
    if (recipientName === fromAmbassador) {
      return;
    }

    let score = calculateReallocationScore(
      recipient,
      recipientName,
      events,
      "events",
      eventDetails,
      limits,
      regionalAmbassadors,
      { ...options, fromRegionalAmbassador: fromEA_RA || undefined }
    );

    if (score < 0) {
      return;
    }

    const reasons: string[] = [];
    const warnings: string[] = [];

    const recipientRA = getRegionalAmbassadorForEventAmbassador(recipientName, regionalAmbassadors);
    if (fromEA_RA !== null && recipientRA === fromEA_RA) {
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
    const neighboringEvents = findNeighboringEvents(recipient.events, events, eventDetails, 50);
    
    const liveEventsCount = recipient.events.length;
    const prospectEventsCount = recipient.prospectiveEvents?.length ?? 0;
    const totalAllocations = liveEventsCount + prospectEventsCount;

    // Primary ordering: total allocation count (fewer = higher priority, 0 = highest)
    // Use a base score that decreases with total allocation count
    const baseScore = Math.max(0, 1000 - (totalAllocations * 10));

    // Secondary ordering: distance to nearest supported event (closer = higher priority)
    let distanceBonus = 0;
    if (neighboringEvents.length > 0) {
      // Closest neighboring event gets bonus (inverse of distance)
      const closestDistance = neighboringEvents[0].distanceKm;
      distanceBonus = Math.max(0, 100 - closestDistance);
    }

    score = baseScore + distanceBonus;
    
    if (proximityScore > 50) {
      reasons.push("Geographic proximity");
    }
    
    if (neighboringEvents.length > 0) {
      const eventList = neighboringEvents.map(e => `${e.name} (${e.distanceKm.toFixed(1)}km)`).join(", ");
      reasons.push(`Nearby events: ${eventList}`);
    }

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
      allocationCount: totalAllocations,
      liveEventsCount,
      prospectEventsCount,
      neighboringEvents: neighboringEvents.length > 0 ? neighboringEvents : undefined,
    });
  });

  // Sort by score (highest first)
  // This will naturally group:
  // 1. Zero allocations (score ~1000+)
  // 2. With neighboring events (score ~500+)
  // 3. Without neighboring events (score <500)
  // Within each group, sorted by allocation count (fewer = higher score)
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

  const suggestions: ReallocationSuggestion[] = [];

  regionalAmbassadors.forEach((recipient, recipientName) => {
    if (recipientName === fromAmbassador) {
      return;
    }

    const dummyEventDetails: EventDetailsMap = new Map();

    let score = calculateReallocationScore(
      recipient,
      recipientName,
      eventAmbassadorNames,
      "eventAmbassadors",
      dummyEventDetails,
      limits,
      regionalAmbassadors,
      { ...options, fromRegionalAmbassador: fromAmbassador }
    );

    if (score < 0) {
      return;
    }

    const reasons: string[] = [];
    const warnings: string[] = [];

    if (recipient.supportsEAs.length < limits.regionalAmbassadorMin) {
      reasons.push("Under capacity");
    } else if (recipient.supportsEAs.length + eventAmbassadorNames.length <= limits.regionalAmbassadorMax) {
      reasons.push("Has available capacity");
    } else {
      warnings.push("Would exceed capacity limit");
    }

    if (recipient.supportsEAs.length + eventAmbassadorNames.length > limits.regionalAmbassadorMax) {
      warnings.push(`Would exceed maximum capacity (${limits.regionalAmbassadorMax})`);
    }

    const allocationCount = recipient.supportsEAs.length;

    // Apply prioritization bonuses for RA-to-RA reallocation
    // 1. Zero allocations get highest priority
    if (allocationCount === 0) {
      score += ZERO_ALLOCATIONS_BONUS;
    }

    // 2. Within each group, prioritize by fewer allocations (subtract allocation count)
    score -= allocationCount;

    suggestions.push({
      fromAmbassador,
      toAmbassador: recipientName,
      items: eventAmbassadorNames,
      score,
      reasons: reasons.length > 0 ? reasons : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      allocationCount,
    });
  });

  return suggestions.sort((a, b) => b.score - a.score);
}

