export const FINISH_EXPORT_USERSCRIPT_GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/johnsyweb/ambassy/refs/heads/main/public/script/ambassy-finish-export.user.js";

export const FINISH_EXPORT_USERSCRIPT_METADATA = {
  name: "Ambassy visit history export",
  description:
    "Export parkrun profile finishes for Ambassy last ambassador visit tracking.",
  author: "Pete Johns (@johnsyweb)",
  downloadUrl: FINISH_EXPORT_USERSCRIPT_GITHUB_RAW_URL,
  updateUrl: FINISH_EXPORT_USERSCRIPT_GITHUB_RAW_URL,
  homepage: "https://www.johnsy.com/ambassy/#finish-history",
  icon: "https://www.google.com/s2/favicons?sz=64&domain=parkrun.com.au",
  license: "MIT",
  namespace: "https://github.com/johnsyweb/ambassy",
  runAt: "document-end",
  supportUrl: "https://github.com/johnsyweb/ambassy/issues/",
  tags: ["parkrun", "ambassy"] as const,
  version: "1.2.2",
  grants: [
    "GM_setValue",
    "GM_getValue",
    "GM_setClipboard",
    "GM_notification",
  ] as const,
};

export const FINISH_EXPORT_USERSCRIPT_CANONICAL_URL =
  FINISH_EXPORT_USERSCRIPT_METADATA.downloadUrl;

const FINISH_EXPORT_USERSCRIPT_PATH = "script/ambassy-finish-export.user.js";

export function buildFinishExportUserscriptHeader(matches: string[]): string {
  const metadata = FINISH_EXPORT_USERSCRIPT_METADATA;

  return [
    "// ==UserScript==",
    `// @name         ${metadata.name}`,
    `// @description  ${metadata.description}`,
    `// @author       ${metadata.author}`,
    `// @downloadURL  ${metadata.downloadUrl}`,
    ...metadata.grants.map((grant) => `// @grant        ${grant}`),
    `// @homepage     ${metadata.homepage}`,
    `// @icon         ${metadata.icon}`,
    `// @license      ${metadata.license}`,
    ...matches.map((match) => `// @match        ${match}`),
    `// @namespace    ${metadata.namespace}`,
    `// @run-at       ${metadata.runAt}`,
    `// @supportURL   ${metadata.supportUrl}`,
    ...metadata.tags.map((tag) => `// @tag          ${tag}`),
    `// @updateURL    ${metadata.updateUrl}`,
    `// @version      ${metadata.version}`,
    "// ==/UserScript==",
  ].join("\n");
}

export function parseUserscriptHeaderValue(
  userscriptSource: string,
  key: string,
): string | null {
  const match = userscriptSource.match(new RegExp(`^// @${key}\\s+(.+)$`, "m"));
  return match ? match[1].trim() : null;
}

export function parseUserscriptHeaderValues(
  userscriptSource: string,
  key: string,
): string[] {
  return [
    ...userscriptSource.matchAll(new RegExp(`^// @${key}\\s+(.+)$`, "gm")),
  ].map((match) => match[1].trim());
}

export function getFinishExportUserscriptInstallUrl(
  baseUrl: string = window.location.href,
): string {
  const { hostname } = new URL(baseUrl);
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return new URL(FINISH_EXPORT_USERSCRIPT_PATH, baseUrl).href;
  }

  return FINISH_EXPORT_USERSCRIPT_CANONICAL_URL;
}

export function replaceUserscriptHeader(
  userscriptSource: string,
  matches: string[],
): string {
  const body = userscriptSource.replace(
    /^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\n?/,
    "",
  );

  return `${buildFinishExportUserscriptHeader(matches)}\n\n${body}`;
}
