import { RegionalAmbassador } from '../models/RegionalAmbassador';
import { RegionalAmbassadorMap } from '../models/RegionalAmbassadorMap';

export interface RegionalAmbassadorRow {
  'RA Name': string;
  'RA State': string;
  'EA Name': string;
}

export function parseRegionalAmbassadors(data: RegionalAmbassadorRow[]): RegionalAmbassadorMap {
  const regionalAmbassadorsMap: RegionalAmbassadorMap = new Map<string, RegionalAmbassador>();
  let currentRA: RegionalAmbassador | null = null;

  data.forEach(row => {
    const raName = row['RA Name'];
    const raState = row['RA State'];
    const eaName = row['EA Name'];

    if (raName) {
      if (currentRA) {
        regionalAmbassadorsMap.set(currentRA.name, currentRA);
      }
      currentRA = {
        name: raName,
        state: raState,
        supportsEAs: []
      };
    }

    if (currentRA && eaName) {
      currentRA.supportsEAs.push(eaName);
    }
  });

  if (currentRA) {
    regionalAmbassadorsMap.set(currentRA['name'], currentRA);
  }

  return regionalAmbassadorsMap;
}