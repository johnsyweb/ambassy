import { RegionalAmbassador } from '../models/RegionalAmbassador';

interface RegionalAmbassadorRow {
  'RA Name': string;
  'RA State': string;
  'EA Name': string;
};

export function parseRegionalAmbassadors(data: RegionalAmbassadorRow[]): RegionalAmbassador[] {
  const regionalAmbassadors: RegionalAmbassador[] = [];
  let currentRA: RegionalAmbassador | null = null;

  data.forEach(row => {
    const raName = row['RA Name'];
    const raState = row['RA State'];
    const eaName = row['EA Name'];

    if (raName) {
      if (currentRA) {
        regionalAmbassadors.push(currentRA);
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
    regionalAmbassadors.push(currentRA);
  }

  return regionalAmbassadors;
}