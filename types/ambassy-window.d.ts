export {};

declare global {
  interface Window {
    ambassyOpenEventMarkerTooltip?: (eventShortName: string) => boolean;
    ambassyAdjustMapZoom?: (delta: number) => boolean;
  }
}
