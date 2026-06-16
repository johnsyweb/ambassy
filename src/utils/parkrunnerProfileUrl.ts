import { CountryMap } from "@models/country";
import {
  FINISH_EXPORT_USERSCRIPT_CANONICAL_URL,
  getFinishExportUserscriptInstallUrl,
} from "@utils/finishExportUserscriptMetadata";

const PARKRUNNER_DISPLAY_PREFIX = "A";

export function isValidParkrunnerIdInput(value: string): boolean {
  const trimmed = value.trim();
  return /^\d+$/.test(trimmed) || /^A\d+$/i.test(trimmed);
}

export function stripParkrunnerIdPrefix(parkrunnerId: string): string {
  return parkrunnerId.trim().replace(/^A/i, "");
}

export function normalizeParkrunnerIdForStorage(parkrunnerId: string): string {
  const numeric = stripParkrunnerIdPrefix(parkrunnerId.trim());
  if (!/^\d+$/.test(numeric)) {
    throw new Error(
      "parkrunner ID must be digits, optionally prefixed with A (e.g. A1001388).",
    );
  }

  return numeric;
}

export function formatParkrunnerIdForDisplay(
  parkrunnerId: string | undefined,
): string {
  if (!parkrunnerId) {
    return "—";
  }

  return `${PARKRUNNER_DISPLAY_PREFIX}${normalizeParkrunnerIdForStorage(parkrunnerId)}`;
}

export function parkrunnerIdsMatch(
  storedId: string,
  incomingId: string,
): boolean {
  return (
    normalizeParkrunnerIdForStorage(storedId) ===
    normalizeParkrunnerIdForStorage(incomingId)
  );
}

export function buildParkrunnerProfileUrl(
  parkrunnerId: string,
  countrycode: number,
  countries: CountryMap,
): string | null {
  if (!parkrunnerId.trim() || !countrycode) {
    return null;
  }

  const country = countries[countrycode.toString()];
  if (!country?.url) {
    return null;
  }

  const profileId = normalizeParkrunnerIdForStorage(parkrunnerId);

  return `https://${country.url}/parkrunner/${profileId}/all/`;
}

export function getFinishExportUserscriptUrl(baseUrl?: string): string {
  return getFinishExportUserscriptInstallUrl(baseUrl);
}

export {
  FINISH_EXPORT_USERSCRIPT_CANONICAL_URL,
  getFinishExportUserscriptInstallUrl,
};

export function getTampermonkeyInstallUrl(userscriptUrl: string): string {
  return `https://www.tampermonkey.net/script_installation.php#url=${encodeURIComponent(userscriptUrl)}`;
}
