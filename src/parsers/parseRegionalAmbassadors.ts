import { RegionalAmbassador } from '../models/regionalAmbassador';

export function parseRegionalAmbassadors(data: any[]): RegionalAmbassador[] {
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