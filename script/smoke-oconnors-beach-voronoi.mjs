#!/usr/bin/env node

import puppeteer from "puppeteer";

const PORT = Number(process.env.PORT ?? 8081);
const BASE_URL = `http://localhost:${PORT}/`;
const CSV_EVENT_NAME = "O'Connors Beach";
const TIMEOUT_MS = 60000;

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const eventAmbassadors = [
      [
        "Ashleigh Nielsen",
        {
          name: "Ashleigh Nielsen",
          events: [CSV_EVENT_NAME],
          regionalAmbassador: "REA Tasmania",
          state: "TAS",
        },
      ],
    ];
    const eventTeams = [
      [
        CSV_EVENT_NAME,
        {
          eventShortName: CSV_EVENT_NAME,
          eventAmbassador: "Ashleigh Nielsen",
          eventDirectors: ["Director"],
        },
      ],
    ];
    const regionalAmbassadors = [
      [
        "REA Tasmania",
        {
          name: "REA Tasmania",
          state: "TAS",
          supportsEAs: ["Ashleigh Nielsen"],
        },
      ],
    ];
    const changesLog = [];

    await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: TIMEOUT_MS });

    await page.evaluate(
      (eaJson, etJson, raJson, logJson) => {
        const prefix = "ambassy:";
        for (const [storage, suffix, value] of [
          [localStorage, "eventAmbassadors", eaJson],
          [localStorage, "eventTeams", etJson],
          [localStorage, "regionalAmbassadors", raJson],
          [localStorage, "changesLog", logJson],
          [sessionStorage, "eventAmbassadors", eaJson],
          [sessionStorage, "eventTeams", etJson],
          [sessionStorage, "regionalAmbassadors", raJson],
          [sessionStorage, "changesLog", logJson],
        ]) {
          storage.setItem(`${prefix}${suffix}`, value);
        }
      },
      JSON.stringify(eventAmbassadors),
      JSON.stringify(eventTeams),
      JSON.stringify(regionalAmbassadors),
      JSON.stringify(changesLog),
    );

    await page.reload({ waitUntil: "networkidle2", timeout: TIMEOUT_MS });

    await page.waitForFunction(
      () => {
        const intro = document.getElementById("introduction");
        const ambassy = document.getElementById("ambassy");
        return (
          intro &&
          ambassy &&
          getComputedStyle(intro).display === "none" &&
          getComputedStyle(ambassy).display !== "none"
        );
      },
      { timeout: TIMEOUT_MS },
    );

    await page.waitForSelector("#mapContainer .leaflet-overlay-pane", {
      timeout: TIMEOUT_MS,
    });

    await page.waitForFunction(
      () => {
        const paths = document.querySelectorAll(
          ".leaflet-overlay-pane svg path",
        );
        return paths.length > 0;
      },
      { timeout: TIMEOUT_MS },
    );

    const polygonCheck = await page.evaluate(() => {
      const paths = [...document.querySelectorAll(".leaflet-overlay-pane svg path")];

      const territoryPaths = paths.filter((path) => {
        const pathData = path.getAttribute("d") ?? "";
        const fillOpacity = Number.parseFloat(
          window.getComputedStyle(path).fillOpacity,
        );
        const isLowFillTerritory =
          fillOpacity > 0 && fillOpacity <= 0.11;
        const isPolygonPath = /L/i.test(pathData);
        return isLowFillTerritory && isPolygonPath;
      });

      return {
        territoryPaths: territoryPaths.length,
        totalPaths: paths.length,
      };
    });

    if (polygonCheck.territoryPaths < 1) {
      fail(
        `expected at least one REA territory polygon on the map (found ${polygonCheck.territoryPaths} territory path(s) among ${polygonCheck.totalPaths} overlay paths)`,
      );
    }

    pass(
      `O'Connors Beach REA territory polygon rendered in browser (${polygonCheck.territoryPaths} territory path(s))`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
