/**
 * Tab management utilities for the tabbed interface
 */

let eventTeamsTabVisibleCallback: (() => void) | null = null;
let issuesTabVisibleCallback: (() => void) | null = null;

export function setEventTeamsTabVisibleCallback(callback: () => void): void {
  eventTeamsTabVisibleCallback = callback;
}

export function setIssuesTabVisibleCallback(callback: () => void): void {
  issuesTabVisibleCallback = callback;
}

export function initializeTabs(): void {
  const tabButtons = document.querySelectorAll<HTMLButtonElement>(".tab-button");

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      switchTab(index);
    });

    // Keyboard navigation: Arrow keys
    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const prevIndex = index > 0 ? index - 1 : tabButtons.length - 1;
        switchTab(prevIndex);
        tabButtons[prevIndex].focus();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        const nextIndex = index < tabButtons.length - 1 ? index + 1 : 0;
        switchTab(nextIndex);
        tabButtons[nextIndex].focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        switchTab(0);
        tabButtons[0].focus();
      } else if (event.key === "End") {
        event.preventDefault();
        switchTab(tabButtons.length - 1);
        tabButtons[tabButtons.length - 1].focus();
      }
    });
  });
}

function switchTab(index: number): void {
  const tabButtons = document.querySelectorAll<HTMLButtonElement>(".tab-button");
  const tabContents = document.querySelectorAll<HTMLElement>(".tab-content");

  // Hide all tabs and remove active state
  tabContents.forEach((content) => {
    content.classList.remove("active");
    content.hidden = true;
  });

  tabButtons.forEach((button) => {
    button.classList.remove("active");
    button.setAttribute("aria-selected", "false");
    button.tabIndex = -1;
  });

  // Show selected tab and activate button
  if (tabContents[index] && tabButtons[index]) {
    tabContents[index].classList.add("active");
    tabContents[index].hidden = false;
    tabButtons[index].classList.add("active");
    tabButtons[index].setAttribute("aria-selected", "true");
    tabButtons[index].tabIndex = 0;

    // Event Teams tab is at index 0
    if (index === 0 && eventTeamsTabVisibleCallback) {
      eventTeamsTabVisibleCallback();
    }

    // Issues tab is at index 4 (after Event Teams, Event Ambassadors, Regional Ambassadors, Changes Log)
    if (index === 4 && issuesTabVisibleCallback) {
      issuesTabVisibleCallback();
    }
  }
}

