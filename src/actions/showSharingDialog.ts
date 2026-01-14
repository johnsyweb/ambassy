import { shareStateAsFile, shareStateAsUrl, shareStateToClipboard, shareStateViaNativeShare } from "./shareState";
import { downloadStateFile } from "./exportState";
import { ShareStateResult } from "@localtypes/SharingTypes";

export function showSharingDialog(): void {
  const dialog = document.getElementById("reallocationDialog") as HTMLElement;
  const title = document.getElementById("reallocationDialogTitle") as HTMLElement;
  const content = document.getElementById("reallocationDialogContent") as HTMLElement;
  const cancelButton = document.getElementById("reallocationDialogCancel") as HTMLButtonElement;

  if (!dialog || !title || !content || !cancelButton) {
    console.error("Dialog elements not found");
    return;
  }

  title.textContent = "Share State";
  content.innerHTML = "";

  const container = document.createElement("div");
  container.style.padding = "1em";

  const instructions = document.createElement("p");
  instructions.textContent = "Choose how you'd like to share your state:";
  instructions.style.marginBottom = "1em";
  container.appendChild(instructions);

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "column";
  buttonContainer.style.gap = "0.5em";

  const errorMessage = document.createElement("div");
  errorMessage.style.color = "#d32f2f";
  errorMessage.style.marginTop = "0.5em";
  errorMessage.style.display = "none";
  errorMessage.setAttribute("role", "alert");

  const successMessage = document.createElement("div");
  successMessage.style.color = "#2e7d32";
  successMessage.style.marginTop = "0.5em";
  successMessage.style.display = "none";

  const createShareButton = (
    label: string,
    icon: string,
    handler: () => Promise<ShareStateResult>
  ): HTMLButtonElement => {
    const button = document.createElement("button");
    button.innerHTML = `${icon} ${label}`;
    button.style.padding = "0.75em 1em";
    button.style.backgroundColor = "#007bff";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";
    button.style.textAlign = "left";
    button.style.width = "100%";

    button.addEventListener("click", async () => {
      errorMessage.style.display = "none";
      successMessage.style.display = "none";
      button.disabled = true;

      try {
        const result = await handler();

        if (result.success) {
          if (result.method === "file" && result.data instanceof Blob) {
            const filename = `ambassy-state-${new Date().toISOString().split("T")[0]}.json`;
            downloadStateFile(result.data, filename);
            successMessage.textContent = "State saved to file successfully!";
          } else if (result.method === "url" && typeof result.data === "string") {
            const currentUrl = window.location.href.split("?")[0];
            const shareUrl = `${currentUrl}?state=${encodeURIComponent(result.data)}`;
            
            const urlInput = document.createElement("input");
            urlInput.type = "text";
            urlInput.value = shareUrl;
            urlInput.style.width = "100%";
            urlInput.style.padding = "0.5em";
            urlInput.style.marginTop = "0.5em";
            urlInput.style.border = "1px solid #ccc";
            urlInput.style.borderRadius = "4px";
            urlInput.readOnly = true;
            urlInput.addEventListener("click", () => {
              urlInput.select();
            });

            const urlLabel = document.createElement("label");
            urlLabel.textContent = "Share this URL:";
            urlLabel.style.display = "block";
            urlLabel.style.marginTop = "0.5em";

            successMessage.innerHTML = "";
            successMessage.appendChild(urlLabel);
            successMessage.appendChild(urlInput);
            successMessage.style.display = "block";
          } else if (result.method === "native") {
            successMessage.textContent = "Shared successfully via your device's share menu!";
            successMessage.style.display = "block";
          } else if (result.method === "clipboard") {
            successMessage.textContent = "State text copied to clipboard! You can now paste it anywhere.";
            successMessage.style.display = "block";
          }
        } else {
          errorMessage.textContent = result.error || "Sharing failed";
          errorMessage.style.display = "block";
        }
      } catch (error) {
        errorMessage.textContent = error instanceof Error ? error.message : "Sharing failed";
        errorMessage.style.display = "block";
      } finally {
        button.disabled = false;
      }
    });

    return button;
  };

  const fileButton = createShareButton("Save to File", "💾", shareStateAsFile);
  const urlButton = createShareButton("Copy Share Link", "🔗", shareStateAsUrl);
  const clipboardButton = createShareButton("Copy State Text", "📋", shareStateToClipboard);
  
  const nativeShareButton = createShareButton("Share via Device", "📱", shareStateViaNativeShare);
  if (!navigator.share) {
    nativeShareButton.disabled = true;
    nativeShareButton.title = "Native sharing not available in this browser";
    nativeShareButton.style.opacity = "0.6";
  }

  buttonContainer.appendChild(fileButton);
  buttonContainer.appendChild(urlButton);
  buttonContainer.appendChild(clipboardButton);
  buttonContainer.appendChild(nativeShareButton);

  container.appendChild(buttonContainer);
  container.appendChild(errorMessage);
  container.appendChild(successMessage);
  content.appendChild(container);

  const handleCancel = () => {
    dialog.style.display = "none";
    errorMessage.style.display = "none";
    successMessage.style.display = "none";
  };

  cancelButton.addEventListener("click", handleCancel);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
    }
  };

  document.addEventListener("keydown", handleKeyDown, { once: true });

  dialog.style.display = "block";
  fileButton.focus();
}
