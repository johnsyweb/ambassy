#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FIXTURE_PATH = path.join(ROOT, "script/fixtures/parkrun-country-hosts.json");
const USERSCRIPT_PATHS = [
  path.join(ROOT, "script/ambassy-finish-export.user.js"),
  path.join(ROOT, "public/script/ambassy-finish-export.user.js"),
];

// Keep METADATA in sync with src/utils/finishExportUserscriptMetadata.ts
const METADATA = {
  name: "Ambassy finish history export",
  description:
    "Export parkrun profile finishes for Ambassy last ambassador visit tracking.",
  author: "Pete Johns (@johnsyweb)",
  downloadUrl:
    "https://johnsy.com/ambassy/script/ambassy-finish-export.user.js",
  updateUrl:
    "https://johnsy.com/ambassy/script/ambassy-finish-export.user.js",
  homepage: "https://johnsy.com/ambassy/#finish-history",
  icon: "https://www.google.com/s2/favicons?sz=64&domain=parkrun.com.au",
  license: "MIT",
  namespace: "https://github.com/johnsyweb/ambassy",
  runAt: "document-end",
  supportUrl: "https://github.com/johnsyweb/ambassy/issues/",
  tags: ["parkrun", "ambassy"],
  version: "1.1.2",
  grants: ["GM_setValue", "GM_getValue", "GM_setClipboard", "GM_notification"],
};

const AMBASSY_ORIGIN_MATCHES = [
  "https://johnsy.com/ambassy*",
  "http://localhost:*/*",
  "http://127.0.0.1:*/*",
];

function buildParkrunnerProfileMatch(host) {
  return `*://${host}/parkrunner/*/all*`;
}

function buildUserscriptMatches(countryHosts) {
  return [
    ...countryHosts.map(buildParkrunnerProfileMatch),
    ...AMBASSY_ORIGIN_MATCHES,
  ];
}

function buildUserscriptHeader(matches) {
  return [
    "// ==UserScript==",
    `// @name         ${METADATA.name}`,
    `// @description  ${METADATA.description}`,
    `// @author       ${METADATA.author}`,
    `// @downloadURL  ${METADATA.downloadUrl}`,
    ...METADATA.grants.map((grant) => `// @grant        ${grant}`),
    `// @homepage     ${METADATA.homepage}`,
    `// @icon         ${METADATA.icon}`,
    `// @license      ${METADATA.license}`,
    ...matches.map((match) => `// @match        ${match}`),
    `// @namespace    ${METADATA.namespace}`,
    `// @run-at       ${METADATA.runAt}`,
    `// @supportURL   ${METADATA.supportUrl}`,
    ...METADATA.tags.map((tag) => `// @tag          ${tag}`),
    `// @updateURL    ${METADATA.updateUrl}`,
    `// @version      ${METADATA.version}`,
    "// ==/UserScript==",
  ].join("\n");
}

function replaceUserscriptHeader(userscriptSource, matches) {
  const body = userscriptSource.replace(
    /^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\n?/,
    "",
  );

  return `${buildUserscriptHeader(matches)}\n\n${body}`;
}

const countryHosts = JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8"));
const matches = buildUserscriptMatches(countryHosts);

for (const userscriptPath of USERSCRIPT_PATHS) {
  const source = fs.readFileSync(userscriptPath, "utf8");
  fs.writeFileSync(userscriptPath, replaceUserscriptHeader(source, matches));
  console.log(`Rebuilt ${path.relative(ROOT, userscriptPath)}`);
}
