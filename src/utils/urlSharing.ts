const DATA_URL_PREFIX = "data:application/json;base64,";
const DEFAULT_MAX_SIZE = 1.5 * 1024 * 1024;

export function createDataUrl(jsonString: string): string {
  const base64 = btoa(unescape(encodeURIComponent(jsonString)));
  return `${DATA_URL_PREFIX}${base64}`;
}

export function parseDataUrl(dataUrl: string): string {
  if (!dataUrl.startsWith(DATA_URL_PREFIX)) {
    throw new Error("Invalid data URL format. Expected data:application/json;base64,...");
  }

  const base64 = dataUrl.substring(DATA_URL_PREFIX.length);
  try {
    return decodeURIComponent(escape(atob(base64)));
  } catch (error) {
    throw new Error(`Failed to parse data URL: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function isDataUrlValid(dataUrl: string, maxSize: number = DEFAULT_MAX_SIZE): boolean {
  if (!dataUrl.startsWith(DATA_URL_PREFIX)) {
    return false;
  }

  try {
    const jsonString = parseDataUrl(dataUrl);
    const sizeInBytes = new Blob([jsonString]).size;
    return sizeInBytes <= maxSize;
  } catch {
    return false;
  }
}
