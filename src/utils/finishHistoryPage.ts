import {
  getFinishExportUserscriptUrl,
  getTampermonkeyInstallUrl,
} from "@utils/parkrunnerProfileUrl";

export const FINISH_HISTORY_PAGE_HASH = "finish-history";

export function isFinishHistoryRoute(): boolean {
  return window.location.hash === `#${FINISH_HISTORY_PAGE_HASH}`;
}

export function showFinishHistoryPage(): void {
  const introduction = document.getElementById("introduction");
  const ambassy = document.getElementById("ambassy");
  const finishHistoryPage = document.getElementById("finishHistoryPage");

  if (introduction) {
    introduction.style.display = "none";
  }
  if (ambassy) {
    ambassy.style.display = "none";
  }
  if (finishHistoryPage) {
    finishHistoryPage.hidden = false;
  }

  updateFinishHistoryBreadcrumb(true);
  document.title = "Ambassador visit history — Ambassy";
}

export function hideFinishHistoryPage(): void {
  const finishHistoryPage = document.getElementById("finishHistoryPage");
  if (finishHistoryPage) {
    finishHistoryPage.hidden = true;
  }

  updateFinishHistoryBreadcrumb(false);
  document.title = "Ambassy";
}

export function restoreMainAmbassyView(hasData: boolean): void {
  hideFinishHistoryPage();

  const introduction = document.getElementById("introduction");
  const ambassy = document.getElementById("ambassy");
  if (!introduction || !ambassy) {
    return;
  }

  if (hasData) {
    introduction.style.display = "none";
    ambassy.style.display = "block";
  } else {
    introduction.style.display = "block";
    ambassy.style.display = "none";
  }
}

export function navigateToFinishHistoryPage(): void {
  window.location.hash = FINISH_HISTORY_PAGE_HASH;
}

export function navigateToMainAmbassyPage(): void {
  const url = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function wireFinishHistoryInstallLinks(
  baseUrl: string = window.location.href,
): void {
  const userscriptUrl = getFinishExportUserscriptUrl(baseUrl);
  const tampermonkeyUrl = getTampermonkeyInstallUrl(userscriptUrl);

  const tampermonkeyInstallLink = document.getElementById(
    "tampermonkeyInstallLink",
  );
  if (tampermonkeyInstallLink instanceof HTMLAnchorElement) {
    tampermonkeyInstallLink.href = tampermonkeyUrl;
  }

  const userscriptSourceLink = document.getElementById("userscriptSourceLink");
  if (userscriptSourceLink instanceof HTMLAnchorElement) {
    userscriptSourceLink.href = userscriptUrl;
  }
}

export function applyAmbassyRoute(hasData: boolean): void {
  if (isFinishHistoryRoute()) {
    showFinishHistoryPage();
    return;
  }

  restoreMainAmbassyView(hasData);
}

function updateFinishHistoryBreadcrumb(onFinishHistoryPage: boolean): void {
  const breadcrumbCurrent = document.getElementById("breadcrumbCurrentPage");
  const breadcrumbFinishHistory = document.getElementById(
    "breadcrumbFinishHistory",
  );
  const breadcrumbFinishHistorySeparator = document.getElementById(
    "breadcrumbFinishHistorySeparator",
  );
  if (
    !breadcrumbCurrent ||
    !breadcrumbFinishHistory ||
    !breadcrumbFinishHistorySeparator
  ) {
    return;
  }

  if (onFinishHistoryPage) {
    breadcrumbCurrent.removeAttribute("aria-current");
    breadcrumbFinishHistorySeparator.hidden = false;
    breadcrumbFinishHistory.hidden = false;
    breadcrumbFinishHistory.setAttribute("aria-current", "page");
    return;
  }

  breadcrumbFinishHistorySeparator.hidden = true;
  breadcrumbFinishHistory.hidden = true;
  breadcrumbFinishHistory.removeAttribute("aria-current");
  breadcrumbCurrent.setAttribute("aria-current", "page");
}
