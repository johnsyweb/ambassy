#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const { updateLastmod } = require("./sitemap-lastmod.js");

const distDir = process.argv[2] || path.join(__dirname, "..", "dist");
const sitemapPath = path.join(distDir, "sitemap.xml");

if (!fs.existsSync(sitemapPath)) {
  console.warn("update-sitemap-lastmod: sitemap.xml not found, skipping");
  process.exit(0);
}

const content = fs.readFileSync(sitemapPath, "utf8");
fs.writeFileSync(sitemapPath, updateLastmod(content));
