// ==UserScript==
// @name         Ambassy visit history export
// @description  Export parkrun profile finishes for Ambassy last ambassador visit tracking.
// @author       Pete Johns (@johnsyweb)
// @downloadURL  https://johnsy.com/ambassy/script/ambassy-finish-export.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_notification
// @homepage     https://johnsy.com/ambassy/#finish-history
// @icon         https://www.google.com/s2/favicons?sz=64&domain=parkrun.com.au
// @license      MIT
// @match        *://www.parkrun.ca/parkrunner/*/all*
// @match        *://www.parkrun.co.at/parkrunner/*/all*
// @match        *://www.parkrun.co.nl/parkrunner/*/all*
// @match        *://www.parkrun.co.nz/parkrunner/*/all*
// @match        *://www.parkrun.co.za/parkrunner/*/all*
// @match        *://www.parkrun.com.au/parkrunner/*/all*
// @match        *://www.parkrun.com.de/parkrunner/*/all*
// @match        *://www.parkrun.dk/parkrunner/*/all*
// @match        *://www.parkrun.fi/parkrunner/*/all*
// @match        *://www.parkrun.ie/parkrunner/*/all*
// @match        *://www.parkrun.it/parkrunner/*/all*
// @match        *://www.parkrun.jp/parkrunner/*/all*
// @match        *://www.parkrun.lt/parkrunner/*/all*
// @match        *://www.parkrun.my/parkrunner/*/all*
// @match        *://www.parkrun.no/parkrunner/*/all*
// @match        *://www.parkrun.org.uk/parkrunner/*/all*
// @match        *://www.parkrun.pl/parkrunner/*/all*
// @match        *://www.parkrun.se/parkrunner/*/all*
// @match        *://www.parkrun.sg/parkrunner/*/all*
// @match        *://www.parkrun.us/parkrunner/*/all*
// @match        https://johnsy.com/ambassy*
// @match        http://localhost:*/*
// @match        http://127.0.0.1:*/*
// @namespace    https://github.com/johnsyweb/ambassy
// @run-at       document-end
// @supportURL   https://github.com/johnsyweb/ambassy/issues/
// @tag          parkrun
// @tag          ambassy
// @updateURL    https://johnsy.com/ambassy/script/ambassy-finish-export.user.js
// @version      1.2.0
// ==/UserScript==




(function () {
  "use strict";

  const PENDING_KEY = "ambassy.pendingFinishImport";
  const STORAGE_KEY = "pendingFinishImport";
  const STORAGE_PREFIX = "ambassy:";
  const SCHEMA_VERSION = 1;
  const READY_EVENT = "ambassy-finish-import-ready";
  const DEFAULT_BUTTON_LABEL = "Export finishes to Ambassy";
  const SUCCESS_RESET_MS = 8000;

  function showExportFeedback(button, statusElement, message, variant) {
    statusElement.textContent = message;
    statusElement.style.color = variant === "error" ? "#b00020" : "#1b5e20";

    if (variant === "success") {
      button.textContent = "Export complete";
      window.setTimeout(() => {
        button.textContent = DEFAULT_BUTTON_LABEL;
      }, SUCCESS_RESET_MS);
    }
  }

  function formatParkrunnerIdForDisplay(parkrunnerId) {
    return `A${parkrunnerId}`;
  }

  function isParkrunnerProfilePage() {
    return /\/parkrunner\/\d+\/all\/?$/i.test(window.location.pathname);
  }

  function isAmbassyPage() {
    return !isParkrunnerProfilePage();
  }

  function parseParkrunnerId() {
    const match = window.location.pathname.match(/\/parkrunner\/(\d+)\/all\/?$/i);
    return match ? match[1] : null;
  }

  function parseParkrunProfileDisplayName() {
    const heading = document.querySelector("h2");
    if (!heading) {
      return undefined;
    }

    const displayName = (heading.textContent || "")
      .replace(/\s*\(A\d+\)\s*$/i, "")
      .trim();
    return displayName || undefined;
  }

  function parseAustralianDate(value) {
    const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) {
      return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (!day || !month || !year) {
      return null;
    }

    return `${year.toString().padStart(4, "0")}-${month
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  }

  function extractEventSlug(href) {
    try {
      const url = new URL(href, window.location.origin);
      const segments = url.pathname.split("/").filter(Boolean);
      return segments[0] ?? null;
    } catch {
      return null;
    }
  }

  function parseFinishesFromProfile() {
    const finishes = [];
    const rows = document.querySelectorAll("table tbody tr");

    rows.forEach((row) => {
      const eventLink = row.querySelector("td a[href*='/results/']");
      const dateSpan = row.querySelector("span.format-date");
      if (!eventLink || !dateSpan) {
        return;
      }

      const eventSlug = extractEventSlug(eventLink.getAttribute("href") || "");
      const isoDate = parseAustralianDate(dateSpan.textContent || "");
      if (!eventSlug || !isoDate) {
        return;
      }

      finishes.push({
        eventSlug,
        eventName: (eventLink.textContent || "").trim(),
        date: isoDate,
        domain: window.location.host,
      });
    });

    return finishes;
  }

  function keepLatestFinishPerEventSlug(finishes) {
    const latestBySlug = new Map();

    for (const finish of finishes) {
      const existing = latestBySlug.get(finish.eventSlug);
      if (!existing || finish.date > existing.date) {
        latestBySlug.set(finish.eventSlug, finish);
      }
    }

    return Array.from(latestBySlug.values());
  }

  function buildPayload(finishes) {
    const parkrunnerId = parseParkrunnerId();
    if (!parkrunnerId) {
      throw new Error("Could not determine parkrunner ID from this page.");
    }

    const payload = {
      schemaVersion: SCHEMA_VERSION,
      parkrunnerId,
      sourceUrl: window.location.href,
      importedAt: new Date().toISOString(),
      finishes,
    };

    const parkrunProfileDisplayName = parseParkrunProfileDisplayName();
    if (parkrunProfileDisplayName) {
      payload.parkrunProfileDisplayName = parkrunProfileDisplayName;
    }

    return payload;
  }

  function queueForAmbassy(payload) {
    GM_setValue(PENDING_KEY, JSON.stringify(payload));
  }

  function writeAmbassyLocalStorage(payload) {
    localStorage.setItem(
      `${STORAGE_PREFIX}${STORAGE_KEY}`,
      JSON.stringify(payload),
    );
    window.dispatchEvent(new CustomEvent(READY_EVENT));
  }

  function exportFromProfile(button, statusElement) {
    try {
      const allFinishes = parseFinishesFromProfile();
      if (allFinishes.length === 0) {
        showExportFeedback(
          button,
          statusElement,
          "No finishes found on this page.",
          "error",
        );
        return;
      }

      const finishes = keepLatestFinishPerEventSlug(allFinishes);
      const payload = buildPayload(finishes);
      queueForAmbassy(payload);

      const clipboardText = JSON.stringify(payload);
      if (typeof GM_setClipboard === "function") {
        GM_setClipboard(clipboardText, {
          type: "text",
          mimetype: "text/plain",
        });
      }

      const parkrunnerLabel = formatParkrunnerIdForDisplay(payload.parkrunnerId);
      const successMessage = `Exported ${finishes.length} events (most recent finish per venue) for parkrunner ${parkrunnerLabel}. Open Ambassy to complete import.`;
      showExportFeedback(button, statusElement, successMessage, "success");

      GM_notification({
        text: successMessage,
        title: "Ambassy",
        timeout: 5000,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Export failed.";
      showExportFeedback(button, statusElement, message, "error");
    }
  }

  function consumePendingImportOnAmbassy() {
    const raw = GM_getValue(PENDING_KEY);
    if (!raw) {
      return;
    }

    try {
      const payload = JSON.parse(raw);
      writeAmbassyLocalStorage(payload);
      GM_setValue(PENDING_KEY, null);
    } catch (error) {
      console.error("Ambassy finish import bridge failed:", error);
    }
  }

  function registerAmbassyBridgeActivation() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        consumePendingImportOnAmbassy();
      }
    });
    window.addEventListener("focus", consumePendingImportOnAmbassy);
  }

  function addProfileExportButton() {
    if (document.getElementById("ambassy-finish-export-button")) {
      return;
    }

    const button = document.createElement("button");
    button.id = "ambassy-finish-export-button";
    button.type = "button";
    button.textContent = DEFAULT_BUTTON_LABEL;
    button.style.margin = "1rem 0";

    const status = document.createElement("p");
    status.id = "ambassy-finish-export-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.style.margin = "0 0 1rem";
    status.style.fontWeight = "600";

    button.addEventListener("click", () => {
      exportFromProfile(button, status);
    });

    const table = document.querySelector("table");
    if (table?.parentElement) {
      table.parentElement.insertBefore(status, table);
      table.parentElement.insertBefore(button, status);
    } else {
      document.body.prepend(status);
      document.body.prepend(button);
    }
  }

  if (isParkrunnerProfilePage()) {
    addProfileExportButton();
  }

  if (isAmbassyPage()) {
    consumePendingImportOnAmbassy();
    registerAmbassyBridgeActivation();
  }
})();
