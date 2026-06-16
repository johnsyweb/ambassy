#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function readPackageVersion(root = path.join(__dirname, "..")) {
  const { version } = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  );
  return version;
}

function injectAppVersion(html, version = readPackageVersion()) {
  const changelogUrl = `https://github.com/johnsyweb/ambassy/blob/v${version}/CHANGELOG.md`;
  return html
    .replaceAll("__APP_VERSION__", `v${version}`)
    .replaceAll("__CHANGELOG_URL__", changelogUrl);
}

function injectAppVersionFile(filePath, version = readPackageVersion()) {
  if (!fs.existsSync(filePath)) {
    console.warn(`inject-app-version: ${filePath} not found, skipping`);
    return;
  }

  const html = fs.readFileSync(filePath, "utf8");
  fs.writeFileSync(filePath, injectAppVersion(html, version));
}

module.exports = {
  injectAppVersion,
  injectAppVersionFile,
  readPackageVersion,
};

if (require.main === module) {
  const distIndex = path.join(__dirname, "..", "dist", "index.html");
  injectAppVersionFile(distIndex);
}
