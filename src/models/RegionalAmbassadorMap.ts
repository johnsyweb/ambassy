import { RegionalAmbassador } from '@models/RegionalAmbassador';

export type RegionalAmbassadorMap = Map<string, RegionalAmbassador>;

export function getRegionalAmbassador(
  eventAmbassadorName: string,
  reverseLookupMap: Map<string, string>,
  regionalAmbassadorsMap: RegionalAmbassadorMap
): RegionalAmbassador | undefined {
  const raName = reverseLookupMap.get(eventAmbassadorName);
  if (raName) {
    return regionalAmbassadorsMap.get(raName);
  }
  return undefined;
}