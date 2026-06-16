import { EventDetailsMap } from "@models/EventDetailsMap";
import { calculateDistance } from "@utils/geography";

export const HOME_PARKRUN_MAX_BONUS = 500;
export const HOME_PARKRUN_THRESHOLD_KM = 50;

export interface HomeParkrunBonusResult {
  bonus: number;
  distanceKm: number;
  homeParkrun: string;
}

export function calculateHomeParkrunBonus(
  homeParkrun: string | undefined,
  candidateEventNames: string[],
  eventDetails: EventDetailsMap,
): HomeParkrunBonusResult | null {
  if (!homeParkrun || candidateEventNames.length === 0) {
    return null;
  }

  const homeDetails = eventDetails.get(homeParkrun);
  if (!homeDetails?.geometry?.coordinates) {
    return null;
  }

  const [homeLon, homeLat] = homeDetails.geometry.coordinates;
  let nearestDistanceKm = Infinity;

  for (const eventName of candidateEventNames) {
    const candidate = eventDetails.get(eventName);
    if (!candidate?.geometry?.coordinates) {
      continue;
    }

    const [candidateLon, candidateLat] = candidate.geometry.coordinates;
    const distanceKm = calculateDistance(
      homeLat,
      homeLon,
      candidateLat,
      candidateLon,
    );
    nearestDistanceKm = Math.min(nearestDistanceKm, distanceKm);
  }

  if (!Number.isFinite(nearestDistanceKm)) {
    return null;
  }

  return buildHomeParkrunBonusResult(homeParkrun, nearestDistanceKm);
}

export function calculateHomeParkrunBonusFromCoordinate(
  homeParkrun: string | undefined,
  candidateLat: number,
  candidateLon: number,
  eventDetails: EventDetailsMap,
): HomeParkrunBonusResult | null {
  if (!homeParkrun) {
    return null;
  }

  const homeDetails = eventDetails.get(homeParkrun);
  if (!homeDetails?.geometry?.coordinates) {
    return null;
  }

  const [homeLon, homeLat] = homeDetails.geometry.coordinates;
  const distanceKm = calculateDistance(
    homeLat,
    homeLon,
    candidateLat,
    candidateLon,
  );

  return buildHomeParkrunBonusResult(homeParkrun, distanceKm);
}

export function formatHomeParkrunReason(
  result: HomeParkrunBonusResult,
): string {
  return `Home parkrun: ${result.homeParkrun} (${result.distanceKm.toFixed(1)} km)`;
}

function buildHomeParkrunBonusResult(
  homeParkrun: string,
  distanceKm: number,
): HomeParkrunBonusResult | null {
  if (distanceKm >= HOME_PARKRUN_THRESHOLD_KM) {
    return null;
  }

  const bonus =
    HOME_PARKRUN_MAX_BONUS * (1 - distanceKm / HOME_PARKRUN_THRESHOLD_KM);

  return {
    bonus,
    distanceKm,
    homeParkrun,
  };
}

export function applyHomeParkrunBonus(
  score: number,
  homeParkrun: string | undefined,
  candidateEventNames: string[],
  eventDetails: EventDetailsMap,
  reasons: string[],
): number {
  const homeBonus = calculateHomeParkrunBonus(
    homeParkrun,
    candidateEventNames,
    eventDetails,
  );

  if (!homeBonus) {
    return score;
  }

  reasons.push(formatHomeParkrunReason(homeBonus));
  return score + homeBonus.bonus;
}

export function applyHomeParkrunBonusFromCoordinate(
  score: number,
  homeParkrun: string | undefined,
  candidateLat: number,
  candidateLon: number,
  eventDetails: EventDetailsMap,
  reasons: string[],
): number {
  const homeBonus = calculateHomeParkrunBonusFromCoordinate(
    homeParkrun,
    candidateLat,
    candidateLon,
    eventDetails,
  );

  if (!homeBonus) {
    return score;
  }

  reasons.push(formatHomeParkrunReason(homeBonus));
  return score + homeBonus.bonus;
}
