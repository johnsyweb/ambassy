export type SharingMethod = "file" | "url" | "clipboard";

export interface ShareStateResult {
  method: SharingMethod;
  success: boolean;
  data?: string | Blob | null;
  error?: string | null;
  timestamp: number;
}

export class SharingError extends Error {
  method: SharingMethod;
  cause: Error | null;

  constructor(message: string, method: SharingMethod, cause: Error | null = null) {
    super(message);
    this.name = "SharingError";
    this.method = method;
    this.cause = cause;
  }
}

export class StateTooLargeError extends SharingError {
  size: number;
  maxSize: number;
  suggestedMethod: SharingMethod;

  constructor(
    message: string,
    method: SharingMethod,
    size: number,
    maxSize: number,
    suggestedMethod: SharingMethod = "file"
  ) {
    super(message, method);
    this.name = "StateTooLargeError";
    this.size = size;
    this.maxSize = maxSize;
    this.suggestedMethod = suggestedMethod;
  }
}

export class ClipboardUnavailableError extends SharingError {
  reason: string;

  constructor(message: string, method: SharingMethod, reason: string) {
    super(message, method);
    this.name = "ClipboardUnavailableError";
    this.reason = reason;
  }
}
