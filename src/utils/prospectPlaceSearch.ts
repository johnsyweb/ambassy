const AU_STATE_CODES = new Set([
  "VIC",
  "NSW",
  "QLD",
  "SA",
  "WA",
  "TAS",
  "NT",
  "ACT",
]);

const NZ_STATE_ALIASES = new Set(["NZ", "NEW ZEALAND"]);

const UK_STATE_ALIASES = new Set([
  "UK",
  "GB",
  "ENG",
  "ENGLAND",
  "SCT",
  "SCOTLAND",
  "WLS",
  "WALES",
  "NIR",
  "NORTHERN IRELAND",
]);

const IE_STATE_ALIASES = new Set(["IE", "IRELAND"]);

const COUNTRY_CODE_TO_SEARCH_NAME: Record<string, string> = {
  AU: "Australia",
  NZ: "New Zealand",
  GB: "United Kingdom",
  IE: "Ireland",
};

function normaliseStateRegion(state: string): string {
  return state.trim().toUpperCase();
}

export function inferExpectedCountryCodeFromStateRegion(
  state: string,
): string | null {
  const normalised = normaliseStateRegion(state);

  if (!normalised) {
    return null;
  }

  if (NZ_STATE_ALIASES.has(normalised)) {
    return "NZ";
  }

  if (AU_STATE_CODES.has(normalised)) {
    return "AU";
  }

  if (UK_STATE_ALIASES.has(normalised)) {
    return "GB";
  }

  if (IE_STATE_ALIASES.has(normalised)) {
    return "IE";
  }

  return null;
}

export function buildPlaceSearchQuery(address: string, state: string): string {
  const trimmedAddress = address.trim();
  const trimmedState = state.trim();
  const expectedCountry = inferExpectedCountryCodeFromStateRegion(trimmedState);
  const countryName = expectedCountry
    ? COUNTRY_CODE_TO_SEARCH_NAME[expectedCountry]
    : undefined;

  if (countryName) {
    return `${trimmedAddress}, ${countryName}`;
  }

  if (trimmedState) {
    return `${trimmedAddress}, ${trimmedState}`;
  }

  return trimmedAddress;
}
