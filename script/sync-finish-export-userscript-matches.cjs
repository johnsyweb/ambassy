#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.resolve(__dirname, "..");
const FIXTURE_PATH = path.join(
  ROOT,
  "script/fixtures/parkrun-country-hosts.json",
);
const USERSCRIPT_PATHS = [
  path.join(ROOT, "script/ambassy-finish-export.user.js"),
  path.join(ROOT, "public/script/ambassy-finish-export.user.js"),
];
const EVENTS_URL = "https://images.parkrun.com/events.json";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to fetch ${url}: HTTP ${response.statusCode}`),
          );
          response.resume();
          return;
        }

        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

function extractCountryHosts(countries) {
  return [
    ...new Set(
      Object.values(countries)
        .map((country) => country.url)
        .filter(Boolean),
    ),
  ].sort();
}

function buildParkrunnerProfileMatch(host) {
  return `*://${host}/parkrunner/*/all*`;
}

const AMBASSY_ORIGIN_MATCHES = [
  "https://www.johnsy.com/ambassy*",
  "http://localhost:*/*",
  "http://127.0.0.1:*/*",
];

function buildUserscriptMatches(countryHosts) {
  return [
    ...countryHosts.map(buildParkrunnerProfileMatch),
    ...AMBASSY_ORIGIN_MATCHES,
  ];
}

function formatUserscriptMatchBlock(matches) {
  return matches.map((match) => `// @match        ${match}`).join("\n");
}

function replaceUserscriptMatchBlock(userscriptSource, matches) {
  return userscriptSource.replace(
    /\/\/ @match[\s\S]*?(?=\/\/ @namespace)/,
    `${formatUserscriptMatchBlock(matches)}\n`,
  );
}

async function main() {
  const events = await fetchJson(EVENTS_URL);
  const countryHosts = extractCountryHosts(events.countries);
  const matches = buildUserscriptMatches(countryHosts);

  fs.writeFileSync(`${FIXTURE_PATH}`, `${JSON.stringify(countryHosts, null, 2)}\n`);

  for (const userscriptPath of USERSCRIPT_PATHS) {
    const source = fs.readFileSync(userscriptPath, "utf8");
    const updated = replaceUserscriptMatchBlock(source, matches);
    fs.writeFileSync(userscriptPath, updated);
    console.log(`Updated ${path.relative(ROOT, userscriptPath)}`);
  }

  console.log(`Synced ${countryHosts.length} parkrun country profile matches.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
