import { PlaceSearchResult } from "@utils/geocoding";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderAddProspectPlaceListboxHtml(
  places: PlaceSearchResult[],
): string {
  if (places.length === 0) {
    return "";
  }

  return `
    <div class="territory-map-search-section" role="group" aria-label="Places">
      <p class="territory-map-search-section-label">Places</p>
      ${places
        .map(
          (place, index) => `
        <button
          type="button"
          class="territory-map-search-option add-prospect-place-option"
          role="option"
          data-place-index="${index}"
          data-latitude="${place.latitude}"
          data-longitude="${place.longitude}"
          data-place-label="${escapeHtml(place.label)}"
        >
          <span>${escapeHtml(place.label)}</span>
        </button>
      `,
        )
        .join("")}
    </div>
  `;
}
