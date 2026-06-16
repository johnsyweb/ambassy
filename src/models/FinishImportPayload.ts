export const FINISH_IMPORT_SCHEMA_VERSION = 1;

export interface FinishImportEntry {
  eventSlug: string;
  eventName: string;
  date: string;
  domain: string;
}

export interface FinishImportPayload {
  schemaVersion: typeof FINISH_IMPORT_SCHEMA_VERSION;
  parkrunnerId: string;
  parkrunProfileDisplayName?: string;
  sourceUrl: string;
  importedAt: string;
  finishes: FinishImportEntry[];
}

export const FINISH_IMPORT_SUPPRESS_AUTO_PROMPT_SESSION_KEY =
  "finishImportSuppressAutoPrompt";

export const PENDING_FINISH_IMPORT_STORAGE_KEY = "pendingFinishImport";
export const FINISH_IMPORT_READY_EVENT = "ambassy-finish-import-ready";
