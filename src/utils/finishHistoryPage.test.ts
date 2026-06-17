import {
  applyAmbassyRoute,
  FINISH_HISTORY_PAGE_HASH,
  hideFinishHistoryPage,
  isFinishHistoryRoute,
  navigateToFinishHistoryPage,
  navigateToMainAmbassyPage,
  restoreMainAmbassyView,
  showFinishHistoryPage,
  wireFinishHistoryInstallLinks,
} from "./finishHistoryPage";

function createAmbassyDom(): void {
  document.body.innerHTML = `
    <nav class="breadcrumbs">
      <span id="breadcrumbCurrentPage" aria-current="page">Ambassy</span>
      <span id="breadcrumbFinishHistorySeparator" hidden>/</span>
      <span id="breadcrumbFinishHistory" hidden>Visit history</span>
    </nav>
    <div id="introduction"></div>
    <div id="ambassy"></div>
    <div id="finishHistoryPage" hidden></div>
    <a id="userscriptInstallLink" class="script-install-button"></a>
  `;
}

describe("finishHistoryPage", () => {
  beforeEach(() => {
    createAmbassyDom();
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("detects the finish history hash route", () => {
    window.location.hash = `#${FINISH_HISTORY_PAGE_HASH}`;
    expect(isFinishHistoryRoute()).toBe(true);

    window.location.hash = "";
    expect(isFinishHistoryRoute()).toBe(false);
  });

  it("shows the finish history page and hides the main views", () => {
    const introduction = document.getElementById("introduction")!;
    const ambassy = document.getElementById("ambassy")!;
    introduction.style.display = "block";
    ambassy.style.display = "block";

    showFinishHistoryPage();

    expect(introduction.style.display).toBe("none");
    expect(ambassy.style.display).toBe("none");
    expect(document.getElementById("finishHistoryPage")?.hidden).toBe(false);
    expect(document.title).toBe("Ambassador visit history — Ambassy");
  });

  it("restores the map view when data is loaded", () => {
    showFinishHistoryPage();
    restoreMainAmbassyView(true);

    expect(document.getElementById("introduction")?.style.display).toBe("none");
    expect(document.getElementById("ambassy")?.style.display).toBe("block");
    expect(document.getElementById("finishHistoryPage")?.hidden).toBe(true);
  });

  it("restores the upload view when data is not loaded", () => {
    showFinishHistoryPage();
    restoreMainAmbassyView(false);

    expect(document.getElementById("introduction")?.style.display).toBe(
      "block",
    );
    expect(document.getElementById("ambassy")?.style.display).toBe("none");
  });

  it("applies the finish history route", () => {
    window.location.hash = `#${FINISH_HISTORY_PAGE_HASH}`;
    applyAmbassyRoute(true);

    expect(document.getElementById("finishHistoryPage")?.hidden).toBe(false);
    expect(document.getElementById("ambassy")?.style.display).toBe("none");
  });

  it("navigates between routes via hash helpers", () => {
    navigateToFinishHistoryPage();
    expect(window.location.hash).toBe(`#${FINISH_HISTORY_PAGE_HASH}`);

    navigateToMainAmbassyPage();
    expect(window.location.hash).toBe("");
  });

  it("wires the userscript install link on the finish history page", () => {
    wireFinishHistoryInstallLinks("http://localhost:8081/");

    const installLink = document.getElementById(
      "userscriptInstallLink",
    ) as HTMLAnchorElement;

    expect(installLink.href).toBe(
      "http://localhost:8081/script/ambassy-finish-export.user.js",
    );
    expect(installLink.classList.contains("script-install-button")).toBe(true);
  });

  it("uses the GitHub raw userscript URL in production", () => {
    wireFinishHistoryInstallLinks("https://www.johnsy.com/ambassy/");

    const installLink = document.getElementById(
      "userscriptInstallLink",
    ) as HTMLAnchorElement;

    expect(installLink.href).toBe(
      "https://raw.githubusercontent.com/johnsyweb/ambassy/refs/heads/main/public/script/ambassy-finish-export.user.js",
    );
  });

  it("updates breadcrumb state when leaving the finish history page", () => {
    showFinishHistoryPage();
    hideFinishHistoryPage();

    expect(document.getElementById("breadcrumbFinishHistory")?.hidden).toBe(
      true,
    );
    expect(
      document
        .getElementById("breadcrumbCurrentPage")
        ?.getAttribute("aria-current"),
    ).toBe("page");
  });
});
