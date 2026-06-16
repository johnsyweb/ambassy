import { AmbassadorRole } from "@models/AmbassadorFinishHistory";
import { formatParkrunnerIdForDisplay } from "@utils/parkrunnerProfileUrl";

export function showParkrunnerIdDialog(
  ambassadorName: string,
  role: AmbassadorRole,
  currentValue: string | undefined,
): Promise<string | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0, 0, 0, 0.45)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "10000";

    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "parkrunnerIdDialogTitle");
    dialog.style.background = "#fff";
    dialog.style.padding = "1.25rem";
    dialog.style.borderRadius = "8px";
    dialog.style.maxWidth = "28rem";
    dialog.style.width = "90%";
    dialog.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.2)";

    const roleLabel =
      role === "ea" ? "Event Ambassador" : "Regional Event Ambassador";
    const title = document.createElement("h2");
    title.id = "parkrunnerIdDialogTitle";
    title.textContent = `Set parkrunner ID for ${ambassadorName}`;
    title.style.marginTop = "0";
    dialog.appendChild(title);

    const description = document.createElement("p");
    description.textContent = `${roleLabel} parkrunner ID from their parkrun profile (e.g. A1001388).`;
    dialog.appendChild(description);

    const label = document.createElement("label");
    label.htmlFor = "parkrunnerIdInput";
    label.textContent = "parkrunner ID";
    label.style.display = "block";
    label.style.marginBottom = "0.5rem";
    dialog.appendChild(label);

    const input = document.createElement("input");
    input.id = "parkrunnerIdInput";
    input.type = "text";
    input.value = currentValue
      ? formatParkrunnerIdForDisplay(currentValue)
      : "";
    input.placeholder = "A1001388";
    input.style.width = "100%";
    input.style.marginBottom = "1rem";
    dialog.appendChild(input);

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "0.5rem";
    actions.style.justifyContent = "flex-end";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", () => {
      overlay.remove();
      resolve(null);
    });

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", () => {
      const value = input.value.trim();
      if (value && !/^[A-Za-z]\d+$/.test(value) && !/^\d+$/.test(value)) {
        alert(
          "parkrunner ID must be digits, optionally prefixed with A (e.g. A1001388).",
        );
        input.focus();
        return;
      }
      overlay.remove();
      resolve(value || null);
    });

    actions.appendChild(cancelButton);
    actions.appendChild(saveButton);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    input.focus();
    input.select();

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveButton.click();
      }
    });

    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        overlay.remove();
        resolve(null);
      }
    });
  });
}
