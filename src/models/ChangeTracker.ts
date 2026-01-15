export interface ChangeTracker {
  lastExportTimestamp: number;
  lastChangeTimestamp: number;
}

export function createChangeTracker(): ChangeTracker {
  return {
    lastExportTimestamp: 0,
    lastChangeTimestamp: 0,
  };
}

export function hasUnsavedChanges(tracker: ChangeTracker): boolean {
  return tracker.lastChangeTimestamp > tracker.lastExportTimestamp;
}
