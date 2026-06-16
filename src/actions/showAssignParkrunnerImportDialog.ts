import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { LogEntry } from "@models/LogEntry";
import { formatParkrunnerIdForDisplay } from "@utils/parkrunnerProfileUrl";
import {
  AmbassadorReference,
  listAmbassadorOptions,
  setAmbassadorParkrunnerId,
} from "./setAmbassadorParkrunnerId";

export function showAssignParkrunnerImportDialog(
  parkrunnerId: string,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
): Promise<AmbassadorReference | null> {
  return new Promise((resolve) => {
    const options = listAmbassadorOptions(
      eventAmbassadors,
      regionalAmbassadors,
    );
    if (options.length === 0) {
      alert(
        `No ambassadors are loaded. Add ambassadors before assigning parkrunner ID ${parkrunnerId}.`,
      );
      resolve(null);
      return;
    }

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
    dialog.setAttribute("aria-labelledby", "assignParkrunnerImportDialogTitle");
    dialog.style.background = "#fff";
    dialog.style.padding = "1.25rem";
    dialog.style.borderRadius = "8px";
    dialog.style.maxWidth = "32rem";
    dialog.style.width = "90%";
    dialog.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.2)";

    const title = document.createElement("h2");
    title.id = "assignParkrunnerImportDialogTitle";
    title.textContent = "Assign parkrunner ID";
    title.style.marginTop = "0";
    dialog.appendChild(title);

    const description = document.createElement("p");
    description.textContent = `Finish history is for parkrunner ID ${formatParkrunnerIdForDisplay(parkrunnerId)}. Choose the ambassador to assign it to before importing.`;
    dialog.appendChild(description);

    const label = document.createElement("label");
    label.htmlFor = "assignParkrunnerImportSelect";
    label.textContent = "Ambassador";
    label.style.display = "block";
    label.style.marginBottom = "0.5rem";
    dialog.appendChild(label);

    const select = document.createElement("select");
    select.id = "assignParkrunnerImportSelect";
    select.style.width = "100%";
    select.style.marginBottom = "1rem";
    for (const option of options) {
      const element = document.createElement("option");
      element.value = `${option.role}:${option.name}`;
      element.textContent = option.label;
      select.appendChild(element);
    }
    dialog.appendChild(select);

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

    const assignButton = document.createElement("button");
    assignButton.type = "button";
    assignButton.textContent = "Assign and import";
    assignButton.addEventListener("click", () => {
      const selected = select.value;
      const separatorIndex = selected.indexOf(":");
      if (separatorIndex <= 0) {
        return;
      }

      const role = selected.slice(0, separatorIndex);
      const name = selected.slice(separatorIndex + 1);
      if (role !== "ea" && role !== "rea") {
        return;
      }

      const ambassador: AmbassadorReference = {
        role,
        name,
      };
      setAmbassadorParkrunnerId(
        ambassador,
        parkrunnerId,
        eventAmbassadors,
        regionalAmbassadors,
        log,
      );
      overlay.remove();
      resolve(ambassador);
    });

    actions.appendChild(cancelButton);
    actions.appendChild(assignButton);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    select.focus();
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        overlay.remove();
        resolve(null);
      }
    });
  });
}
