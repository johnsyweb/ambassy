import { showReallocationDialog } from "./showReallocationDialog";
import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";

jest.mock("./getReallocationSuggestions");

describe("showReallocationDialog", () => {
  let dialog: HTMLElement;
  let title: HTMLElement;
  let content: HTMLElement;
  let cancelButton: HTMLButtonElement;
  let onSelect: jest.Mock;
  let onCancel: jest.Mock;
  let suggestions: ReallocationSuggestion[];
  let eventAmbassadors: EventAmbassadorMap;

  beforeEach(() => {
    eventAmbassadors = new Map();
    eventAmbassadors.set("Current EA", { name: "Current EA", events: [] });
    eventAmbassadors.set("EA 1", { name: "EA 1", events: [] });
    eventAmbassadors.set("EA 2", { name: "EA 2", events: [] });
    eventAmbassadors.set("EA 3", { name: "EA 3", events: [] });
    eventAmbassadors.set("EA 4", { name: "EA 4", events: [] });
    document.body.innerHTML = `
      <div id="reallocationDialog" role="dialog" aria-labelledby="reallocationDialogTitle" aria-modal="true" style="display: none;">
        <h2 id="reallocationDialogTitle">Select Recipient</h2>
        <div id="reallocationDialogContent"></div>
        <button type="button" id="reallocationDialogCancel">Cancel</button>
      </div>
    `;

    dialog = document.getElementById("reallocationDialog")!;
    title = document.getElementById("reallocationDialogTitle")!;
    content = document.getElementById("reallocationDialogContent")!;
    cancelButton = document.getElementById("reallocationDialogCancel") as HTMLButtonElement;

    onSelect = jest.fn();
    onCancel = jest.fn();

    suggestions = [
      {
        fromAmbassador: "Current EA",
        toAmbassador: "EA 1",
        items: ["test-event"],
        score: 85,
        reasons: ["Has available capacity", "Geographic proximity"],
      },
      {
        fromAmbassador: "Current EA",
        toAmbassador: "EA 2",
        items: ["test-event"],
        score: 75,
        reasons: ["Same region"],
      },
      {
        fromAmbassador: "Current EA",
        toAmbassador: "EA 3",
        items: ["test-event"],
        score: 65,
        reasons: ["Has available capacity"],
        warnings: ["Would exceed capacity limit"],
      },
    ];
  });

  it("should display dialog with suggestions", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    expect(dialog.style.display).not.toBe("none");
    expect(title.textContent).toContain("test-event");
  });

  it("should create suggestion buttons for top suggestions", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const buttons = content.querySelectorAll("button.suggestion-button");
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.length).toBeLessThanOrEqual(5);
  });

  it("should display ambassador name and score on suggestion buttons", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    expect(firstButton).not.toBeNull();
    expect(firstButton.textContent).toContain("EA 1");
    expect(firstButton.textContent).toContain("85");
  });

  it("should display reasons for suggestions", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    const reasonsText = firstButton.textContent || "";
    expect(reasonsText).toContain("Has available capacity");
    expect(reasonsText).toContain("Geographic proximity");
  });

  it("should display warnings for suggestions", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const buttons = Array.from(content.querySelectorAll("button.suggestion-button")) as HTMLButtonElement[];
    const buttonWithWarning = buttons.find((btn) => btn.textContent?.includes("Would exceed capacity limit"));
    expect(buttonWithWarning).not.toBeUndefined();
  });

  it("should create Other dropdown with all ambassadors", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const dropdown = content.querySelector("select#otherRecipientSelect") as HTMLSelectElement;
    expect(dropdown).not.toBeNull();
  });

  it("should call onSelect when suggestion button is clicked", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    firstButton.click();

    expect(onSelect).toHaveBeenCalledWith("EA 1");
  });

  it("should call onSelect when Other dropdown option is selected", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const dropdown = content.querySelector("select#otherRecipientSelect") as HTMLSelectElement;
    dropdown.value = "EA 4";
    dropdown.dispatchEvent(new Event("change"));

    expect(onSelect).toHaveBeenCalledWith("EA 4");
  });

  it("should call onCancel when Cancel button is clicked", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    cancelButton.click();

    expect(onCancel).toHaveBeenCalled();
  });

  it("should call onCancel when Escape key is pressed", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(onCancel).toHaveBeenCalled();
  });

  it("should move focus to first suggestion button when dialog opens", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    expect(document.activeElement).toBe(firstButton);
  });

  it("should handle Arrow key navigation between buttons", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    firstButton.focus();

    const arrowDownEvent = new KeyboardEvent("keydown", { key: "ArrowDown" });
    firstButton.dispatchEvent(arrowDownEvent);

    const secondButton = content.querySelectorAll("button.suggestion-button")[1] as HTMLButtonElement;
    expect(document.activeElement).toBe(secondButton);
  });

  it("should close dialog after selection", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
    firstButton.click();

    expect(dialog.style.display).toBe("none");
  });

  it("should close dialog after cancel", () => {
    showReallocationDialog("test-event", "Current EA", suggestions, eventAmbassadors, undefined, onSelect, onCancel);

    cancelButton.click();

    expect(dialog.style.display).toBe("none");
  });
});
