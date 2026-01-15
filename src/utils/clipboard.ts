export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      throw new Error(`Clipboard write failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-999999px";
  textarea.style.top = "-999999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (!successful) {
      throw new Error("execCommand('copy') failed");
    }
  } catch (error) {
    document.body.removeChild(textarea);
    throw new Error(`Clipboard copy failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
