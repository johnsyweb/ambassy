export const PARKRUN_PROFILE_PATH_PATTERN = "/parkrunner/*/all*";

export const FINISH_EXPORT_AMBASSY_ORIGIN_MATCHES = [
  "https://johnsy.com/ambassy*",
  "http://localhost:*/*",
  "http://127.0.0.1:*/*",
] as const;

export function buildParkrunnerProfileMatch(host: string): string {
  return `*://${host}${PARKRUN_PROFILE_PATH_PATTERN}`;
}

export function extractCountryHostsFromEventsCountries(
  countries: Record<string, { url?: string | null }>,
): string[] {
  return [
    ...new Set(
      Object.values(countries)
        .map((country) => country.url)
        .filter((url): url is string => Boolean(url)),
    ),
  ].sort();
}

export function buildFinishExportUserscriptMatches(
  countryHosts: string[],
): string[] {
  const profileMatches = [...new Set(countryHosts)]
    .filter(Boolean)
    .sort()
    .map(buildParkrunnerProfileMatch);

  return [...profileMatches, ...FINISH_EXPORT_AMBASSY_ORIGIN_MATCHES];
}

export function parseUserscriptMatchLines(userscriptSource: string): string[] {
  return [...userscriptSource.matchAll(/^\/\/ @match\s+(.+)$/gm)].map((match) =>
    match[1].trim(),
  );
}

export function formatUserscriptMatchBlock(matches: string[]): string {
  return matches.map((match) => `// @match        ${match}`).join("\n");
}

export function replaceUserscriptMatchBlock(
  userscriptSource: string,
  matches: string[],
): string {
  return userscriptSource.replace(
    /\/\/ @match[\s\S]*?(?=\/\/ @namespace)/,
    `${formatUserscriptMatchBlock(matches)}\n`,
  );
}
