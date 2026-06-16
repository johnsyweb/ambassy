#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST_USERSCRIPT_PATH = path.join(
  ROOT,
  "dist/script/ambassy-finish-export.user.js",
);

function fail(message) {
  console.error(`verify-finish-export-userscript-dist: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(DIST_USERSCRIPT_PATH)) {
  fail(`missing ${path.relative(ROOT, DIST_USERSCRIPT_PATH)}`);
}

const userscriptSource = fs.readFileSync(DIST_USERSCRIPT_PATH, "utf8");

if (!userscriptSource.startsWith("// ==UserScript==")) {
  fail(
    "dist userscript must start with a Tampermonkey metadata block; webpack minification may have stripped it",
  );
}

if (!userscriptSource.includes("// ==/UserScript==")) {
  fail("dist userscript is missing the closing Tampermonkey metadata marker");
}

if (userscriptSource.includes("/*! For license information")) {
  fail("dist userscript looks minified; exclude .user.js files from Terser");
}

console.log(
  `Verified ${path.relative(ROOT, DIST_USERSCRIPT_PATH)} is a valid userscript`,
);
