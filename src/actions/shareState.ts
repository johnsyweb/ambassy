import { exportApplicationState } from "./exportState";
import { markStateExported } from "./trackChanges";
import { copyToClipboard } from "@utils/clipboard";
import { createDataUrl, isDataUrlValid } from "@utils/urlSharing";
import { ShareStateResult, StateTooLargeError } from "../types/SharingTypes";

const MAX_URL_SIZE = 1.5 * 1024 * 1024;

async function blobToString(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to read blob"));
    };
    reader.readAsText(blob);
  });
}

export async function shareStateAsFile(): Promise<ShareStateResult> {
  try {
    const blob = exportApplicationState();
    markStateExported();
    return {
      method: "file",
      success: true,
      data: blob,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      method: "file",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now(),
    };
  }
}

export async function shareStateAsUrl(): Promise<ShareStateResult> {
  try {
    const blob = exportApplicationState();
    const jsonString = await blobToString(blob);
    const sizeInBytes = new Blob([jsonString]).size;

    if (sizeInBytes > MAX_URL_SIZE) {
      return {
        method: "url",
        success: false,
        error: `State is too large for URL sharing (${Math.round(sizeInBytes / 1024)}KB). Please use file download instead.`,
        timestamp: Date.now(),
      };
    }

    const dataUrl = createDataUrl(jsonString);
    markStateExported();
    return {
      method: "url",
      success: true,
      data: dataUrl,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      method: "url",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now(),
    };
  }
}

export async function shareStateToClipboard(): Promise<ShareStateResult> {
  try {
    const blob = exportApplicationState();
    const jsonString = await blobToString(blob);
    await copyToClipboard(jsonString);
    markStateExported();
    return {
      method: "clipboard",
      success: true,
      data: null,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      method: "clipboard",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now(),
    };
  }
}
