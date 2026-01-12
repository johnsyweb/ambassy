import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { CapacityLimits } from "@models/CapacityLimits";
import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { getRegionalAmbassadorForEventAmbassador } from "../utils/regions";

/**
 * Generate reallocation suggestions for an Event Ambassador to Regional Ambassadors.
 * Prioritizes REAs in the same state, then by available capacity (most capacity first).
 */
export function getEAReallocationSuggestions(
  eventAmbassadorName: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  limits: CapacityLimits
): ReallocationSuggestion[] {
  if (!eventAmbassadors.has(eventAmbassadorName)) {
    throw new Error(`Event Ambassador "${eventAmbassadorName}" not found`);
  }

  const currentREA = getRegionalAmbassadorForEventAmbassador(eventAmbassadorName, regionalAmbassadors);
  const currentREAState = currentREA ? regionalAmbassadors.get(currentREA)?.state : null;

  const suggestions: ReallocationSuggestion[] = [];

  regionalAmbassadors.forEach((recipient, recipientName) => {
    // Skip the current REA
    if (recipientName === currentREA) {
      return;
    }

    const currentEACount = recipient.supportsEAs.length;
    const availableCapacity = limits.regionalAmbassadorMax - currentEACount;

    // Skip if adding this EA would exceed capacity
    if (currentEACount + 1 > limits.regionalAmbassadorMax) {
      return;
    }

    const reasons: string[] = [];
    const warnings: string[] = [];

    // Prioritize same state
    const isSameState = currentREAState !== null && recipient.state === currentREAState;
    if (isSameState) {
      reasons.push(`Same state (${recipient.state})`);
    }

    // Capacity information
    if (currentEACount < limits.regionalAmbassadorMin) {
      reasons.push("Under capacity");
    } else if (availableCapacity > 0) {
      reasons.push(`Has ${availableCapacity} available capacity`);
    }

    if (currentEACount + 1 > limits.regionalAmbassadorMax) {
      warnings.push(`Would exceed maximum capacity (${limits.regionalAmbassadorMax})`);
    }

    // Calculate score:
    // - Base score: available capacity (more capacity = higher score)
    // - Bonus for same state: +1000
    // - Penalty for being at or near capacity
    let score = availableCapacity * 10; // Scale capacity for better sorting
    
    if (isSameState) {
      score += 1000; // Large bonus for same state
    }

    // Small penalty for being close to max capacity
    if (currentEACount >= limits.regionalAmbassadorMax - 1) {
      score -= 50;
    }

    suggestions.push({
      fromAmbassador: currentREA || "",
      toAmbassador: recipientName,
      items: [eventAmbassadorName],
      score,
      reasons: reasons.length > 0 ? reasons : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      allocationCount: currentEACount,
    });
  });

  // Sort by score (highest first)
  // This will naturally group:
  // 1. Same state REAs (score 1000+)
  // 2. Different state REAs (score <1000)
  // Within each group, sorted by available capacity (more capacity = higher score)
  return suggestions.sort((a, b) => b.score - a.score);
}
