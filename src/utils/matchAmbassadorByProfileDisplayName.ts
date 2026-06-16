import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { AmbassadorReference } from "@actions/setAmbassadorParkrunnerId";

export function normalizeAmbassadorNameForMatch(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function findUniqueAmbassadorByProfileDisplayName(
  parkrunProfileDisplayName: string | undefined,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
): AmbassadorReference | null {
  if (!parkrunProfileDisplayName?.trim()) {
    return null;
  }

  const normalizedProfileName = normalizeAmbassadorNameForMatch(
    parkrunProfileDisplayName,
  );
  const matches: AmbassadorReference[] = [];

  for (const name of eventAmbassadors.keys()) {
    if (normalizeAmbassadorNameForMatch(name) === normalizedProfileName) {
      matches.push({ role: "ea", name });
    }
  }

  for (const name of regionalAmbassadors.keys()) {
    if (normalizeAmbassadorNameForMatch(name) === normalizedProfileName) {
      matches.push({ role: "rea", name });
    }
  }

  return matches.length === 1 ? matches[0] : null;
}
