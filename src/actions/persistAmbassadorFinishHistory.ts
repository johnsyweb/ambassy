import { AmbassadorFinishHistoryMap } from "@models/AmbassadorFinishHistory";
import { loadFromStorage, saveToStorage } from "@utils/storage";

const STORAGE_KEY = "ambassadorFinishHistories";

export function loadAmbassadorFinishHistories(): AmbassadorFinishHistoryMap {
  return loadFromStorage<AmbassadorFinishHistoryMap>(STORAGE_KEY) ?? {};
}

export function persistAmbassadorFinishHistories(
  histories: AmbassadorFinishHistoryMap,
): void {
  saveToStorage(STORAGE_KEY, histories);
}
