#!/usr/bin/env ts-node

import puppeteer from "puppeteer";
import {
  createReadStream,
  existsSync,
  readFileSync,
  statSync,
} from "fs";
import * as path from "path";
import * as net from "net";
import * as http from "http";
import Papa from "papaparse";
import {
  parseEventTeams,
  type EventTeamRow,
} from "../src/parsers/parseEventTeams";
import {
  parseEventAmbassadors,
  type EventAmbassadorRow,
} from "../src/parsers/parseEventAmbassadors";
import {
  parseRegionalAmbassadors,
  type RegionalAmbassadorRow,
} from "../src/parsers/parseRegionalAmbassadors";
import type { EventDetails } from "../src/models/EventDetails";
import { EVENTS_CATALOGUE_CACHE_KEY } from "../src/actions/fetchEvents";

const TIMEOUT_MS = 120_000;
const EVENTS_COUNTRIES_CACHE_KEY = "parkrun countries";
const MAX_OVERLAY_PATHS = 500;
const MAX_DOM_NODES = 10_000;
const BROWSER_CLOSE_TIMEOUT_MS = 10_000;

const MIME_TYPES: Record<string, string> = {
  ".csv": "text/csv; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function pass(message: string): void {
  console.log(`PASS: ${message}`);
}

function step(message: string): void {
  console.log(`[smoke:map-dom-budget] ${message}`);
}

function buildStubEventsCatalogueJson(eventNames: string[]): string {
  const eventDetailsMap: Array<[string, EventDetails]> = eventNames.map(
    (name, index) => {
      const latitude = -37.8 + (index % 20) * 0.05;
      const longitude = 144.9 + Math.floor(index / 20) * 0.05;

      return [
        name,
        {
          id: name,
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          properties: {
            eventname: name.toLowerCase().replace(/\s+/g, ""),
            EventLongName: name,
            EventShortName: name,
            LocalisedEventLongName: name,
            countrycode: 3,
            seriesid: 1,
            EventLocation: "Victoria",
          },
        },
      ];
    },
  );

  return JSON.stringify({
    timestamp: Date.now(),
    eventDetailsMap,
  });
}

function buildStubCountriesCatalogueJson(): string {
  return JSON.stringify({
    timestamp: Date.now(),
    countries: {},
  });
}

function isLocalRequest(url: string, baseUrl: string): boolean {
  try {
    const requestOrigin = new URL(url).origin;
    const localOrigin = new URL(baseUrl).origin;
    return requestOrigin === localOrigin;
  } catch {
    return false;
  }
}

function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        findAvailablePort(startPort + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(error);
      }
    });
  });
}

async function startStaticServer(
  distDirectory: string,
  port: number,
): Promise<http.Server> {
  const distRoot = path.resolve(distDirectory);

  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const filePath = resolveDistFile(distRoot, request.url ?? "/");
      if (!filePath) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      response.setHeader(
        "Content-Type",
        MIME_TYPES[extension] ?? "application/octet-stream",
      );
      createReadStream(filePath)
        .on("error", () => {
          response.writeHead(500);
          response.end("Internal Server Error");
        })
        .pipe(response);
    });

    server.on("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function resolveDistFile(
  distRoot: string,
  requestPath: string,
): string | null {
  const pathname = decodeURIComponent(requestPath.split("?")[0] ?? "/");
  const relativePath = pathname.replace(/^\/+/, "") || "index.html";
  const candidate = path.resolve(distRoot, relativePath);

  if (candidate !== distRoot && !candidate.startsWith(`${distRoot}${path.sep}`)) {
    return null;
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  const indexPath = path.join(distRoot, "index.html");
  return existsSync(indexPath) ? indexPath : null;
}

async function stopStaticServer(server: http.Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function closeBrowser(
  browser: Awaited<ReturnType<typeof puppeteer.launch>>,
): Promise<void> {
  const pages = await browser.pages();
  await Promise.all(
    pages.map((page) => page.close({ runBeforeUnload: false })),
  );

  try {
    await Promise.race([
      browser.close(),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Timed out closing browser")),
          BROWSER_CLOSE_TIMEOUT_MS,
        );
      }),
    ]);
  } catch {
    browser.process()?.kill("SIGKILL");
  }
}

function loadSampleAllocationState(): {
  eventAmbassadorsJson: string;
  eventTeamsJson: string;
  regionalAmbassadorsJson: string;
  eventsCatalogueJson: string;
  countriesCatalogueJson: string;
} {
  const publicDir = path.join(process.cwd(), "public");
  const eventAmbassadorsData = readFileSync(
    path.join(publicDir, "Ambassadors - Event Ambassadors.csv"),
    "utf-8",
  );
  const eventTeamsData = readFileSync(
    path.join(publicDir, "Ambassadors - Event Teams.csv"),
    "utf-8",
  );
  const regionalAmbassadorsData = readFileSync(
    path.join(publicDir, "Ambassadors - Regional Ambassadors.csv"),
    "utf-8",
  );

  const eventAmbassadors = parseEventAmbassadors(
    Papa.parse<EventAmbassadorRow>(eventAmbassadorsData, {
      header: true,
      skipEmptyLines: true,
    }).data,
  );
  const eventTeams = parseEventTeams(
    Papa.parse<EventTeamRow>(eventTeamsData, {
      header: true,
      skipEmptyLines: true,
    }).data,
  );
  const regionalAmbassadors = parseRegionalAmbassadors(
    Papa.parse<RegionalAmbassadorRow>(regionalAmbassadorsData, {
      header: true,
      skipEmptyLines: true,
    }).data,
  );

  const eventNames = Array.from(eventTeams.keys()).filter(Boolean);

  return {
    eventAmbassadorsJson: JSON.stringify(
      Array.from(eventAmbassadors.entries()),
    ),
    eventTeamsJson: JSON.stringify(Array.from(eventTeams.entries())),
    regionalAmbassadorsJson: JSON.stringify(
      Array.from(regionalAmbassadors.entries()),
    ),
    eventsCatalogueJson: buildStubEventsCatalogueJson(eventNames),
    countriesCatalogueJson: buildStubCountriesCatalogueJson(),
  };
}

async function main(): Promise<void> {
  const distDirectory = path.join(process.cwd(), "dist");
  if (!existsSync(path.join(distDirectory, "index.html"))) {
    fail(
      "dist/ is missing index.html — run aube run build before smoke:map-dom-budget",
    );
  }

  const port = Number(process.env.PORT ?? (await findAvailablePort(8081)));
  const baseUrl = process.env.BASE_URL ?? `http://localhost:${port}/`;
  const shouldStartServer = !process.env.BASE_URL;
  let staticServer: http.Server | null = null;

  if (shouldStartServer) {
    step(`starting static server on port ${port}`);
    staticServer = await startStaticServer(distDirectory, port);
    step("static server ready");
  }

  step("launching browser");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    timeout: 60_000,
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(TIMEOUT_MS);
    page.setDefaultTimeout(TIMEOUT_MS);
    await page.setViewport({ width: 1280, height: 800 });

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = request.url();
      if (isLocalRequest(url, baseUrl)) {
        request.continue();
        return;
      }

      if (
        url.includes("tile.openstreetmap.org") ||
        url.includes("images.parkrun.com")
      ) {
        request.abort();
        return;
      }

      request.continue();
    });

    const {
      eventAmbassadorsJson,
      eventTeamsJson,
      regionalAmbassadorsJson,
      eventsCatalogueJson,
      countriesCatalogueJson,
    } = loadSampleAllocationState();

    step(`loading ${baseUrl}`);
    await page.goto(baseUrl, {
      waitUntil: "load",
      timeout: TIMEOUT_MS,
    });

    await page.evaluate(
      (
        eaJson,
        etJson,
        raJson,
        eventsJson,
        countriesJson,
        eventsCacheKey,
        countriesCacheKey,
      ) => {
        const prefix = "ambassy:";
        const changesLog = "[]";
        for (const [storage, suffix, value] of [
          [localStorage, "eventAmbassadors", eaJson],
          [localStorage, "eventTeams", etJson],
          [localStorage, "regionalAmbassadors", raJson],
          [localStorage, "changesLog", changesLog],
          [sessionStorage, "eventAmbassadors", eaJson],
          [sessionStorage, "eventTeams", etJson],
          [sessionStorage, "regionalAmbassadors", raJson],
          [sessionStorage, "changesLog", changesLog],
        ] as const) {
          storage.setItem(`${prefix}${suffix}`, value);
        }

        localStorage.setItem(eventsCacheKey, eventsJson);
        localStorage.setItem(countriesCacheKey, countriesJson);
      },
      eventAmbassadorsJson,
      eventTeamsJson,
      regionalAmbassadorsJson,
      eventsCatalogueJson,
      countriesCatalogueJson,
      EVENTS_CATALOGUE_CACHE_KEY,
      EVENTS_COUNTRIES_CACHE_KEY,
    );

    step("reloading with sample allocation data");
    await page.reload({ waitUntil: "load", timeout: TIMEOUT_MS });

    step("waiting for main UI");
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

    step("waiting for map overlay pane");
    await page.waitForSelector("#mapContainer .leaflet-overlay-pane", {
      timeout: TIMEOUT_MS,
    });

    step("waiting for canvas markers");
    await page.waitForFunction(
      () =>
        document.querySelectorAll("#mapContainer .leaflet-overlay-pane canvas")
          .length > 0,
      { timeout: TIMEOUT_MS },
    );

    const metrics = await page.evaluate(() => ({
      overlayPaths: document.querySelectorAll(".leaflet-overlay-pane svg path")
        .length,
      overlayCanvasLayers: document.querySelectorAll(
        ".leaflet-overlay-pane canvas",
      ).length,
      domNodes: document.querySelectorAll("*").length,
    }));

    if (metrics.overlayPaths >= MAX_OVERLAY_PATHS) {
      fail(
        `expected fewer than ${MAX_OVERLAY_PATHS} Leaflet overlay paths, found ${metrics.overlayPaths}`,
      );
    }

    if (metrics.domNodes >= MAX_DOM_NODES) {
      fail(
        `expected fewer than ${MAX_DOM_NODES} DOM nodes, found ${metrics.domNodes}`,
      );
    }

    if (metrics.domNodes < 2_000) {
      fail(
        `expected sample CSVs to produce a populated UI, found only ${metrics.domNodes} DOM nodes`,
      );
    }

    if (metrics.overlayCanvasLayers < 1) {
      fail("expected at least one Leaflet canvas overlay for event markers");
    }

    pass(
      `map DOM budget ok (${metrics.overlayPaths} overlay paths, ${metrics.overlayCanvasLayers} canvas layer(s), ${metrics.domNodes} DOM nodes)`,
    );
  } finally {
    step("closing browser");
    await closeBrowser(browser);
    if (staticServer) {
      step("stopping static server");
      await stopStaticServer(staticServer);
    }
  }
}

main()
  .then(() => {
    step("done");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
