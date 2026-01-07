import { RegionalAmbassadorMap } from "../models/RegionalAmbassadorMap";

export function getRegionalAmbassadorForEventAmbassador(
  eventAmbassadorName: string,
  regionalAmbassadors: RegionalAmbassadorMap
): string | null {
  for (const [raName, ra] of regionalAmbassadors.entries()) {
    if (ra.supportsEAs.includes(eventAmbassadorName)) {
      return raName;
    }
  }
  return null;
}

export function areEventAmbassadorsInSameRegion(
  ea1Name: string,
  ea2Name: string,
  regionalAmbassadors: RegionalAmbassadorMap
): boolean {
  const ra1 = getRegionalAmbassadorForEventAmbassador(ea1Name, regionalAmbassadors);
  const ra2 = getRegionalAmbassadorForEventAmbassador(ea2Name, regionalAmbassadors);
  
  if (ra1 === null || ra2 === null) {
    return false;
  }
  
  return ra1 === ra2;
}
