import { exportApplicationState } from "./exportState";
import { markStateExported } from "./trackChanges";
import { copyToClipboard } from "@utils/clipboard";
import { createDataUrl } from "@utils/urlSharing";

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

export async function shareStateViaNativeShare(): Promise<ShareStateResult> {
  try {
    if (!navigator.share) {
      return {
        method: "native",
        success: false,
        error: "Native sharing is not available in this browser. Please use another sharing method.",
        timestamp: Date.now(),
      };
    }

    const blob = exportApplicationState();
    const jsonString = await blobToString(blob);
    const sizeInBytes = new Blob([jsonString]).size;

    if (sizeInBytes > MAX_URL_SIZE) {
      return {
        method: "native",
        success: false,
        error: `State is too large to share as a link (${Math.round(
          sizeInBytes / 1024,
        )}KB). Please use "Save to File" or "Copy State Text" instead.`,
        timestamp: Date.now(),
      };
    }

    const currentUrl = window.location.href.split("?")[0];
    const dataUrl = createDataUrl(jsonString);
    const shareUrl = `${currentUrl}?state=${encodeURIComponent(dataUrl)}`;

    // Avoid creating URLs that are too long for typical server/browser limits
    const MAX_URL_LENGTH = 2000;
    if (shareUrl.length > MAX_URL_LENGTH) {
      return {
        method: "native",
        success: false,
        error:
          'State is too large to share as a link. Please use "Save to File" or "Copy State Text" instead.',
        timestamp: Date.now(),
      };
    }

    await navigator.share({
      title: "Ambassy Map and Allocations",
      text: "Shared Ambassy map and event allocations",
      url: shareUrl,
    });

    markStateExported();
    return {
      method: "native",
      success: true,
      data: shareUrl,
      timestamp: Date.now(),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        method: "native",
        success: false,
        error: "Sharing was cancelled",
        timestamp: Date.now(),
      };
    }
    return {
      method: "native",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now(),
    };
  }
}
