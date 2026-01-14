declare module 'd3-geo-voronoi' {
  import { FeatureCollection, Polygon } from 'geojson';

  export function geoVoronoi(points: [number, number][]): {
    polygons(): FeatureCollection<Polygon>;
  };

  // Explicitly prevent default export to catch incorrect imports at build time
  export default _noDefaultExport: never;
}
