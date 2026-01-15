declare module "d3-geo-voronoi" {
  import { FeatureCollection, Polygon } from "geojson";

  export function geoVoronoi(points: [number, number][]): {
    polygons(): FeatureCollection<Polygon>;
  };

  // Explicitly declare no default export to prevent incorrect default imports
  // This module only exports named exports (geoVoronoi)
  // Use: import { geoVoronoi } from 'd3-geo-voronoi';
  // DO NOT use: import d3GeoVoronoi from 'd3-geo-voronoi';
  
  // Prevent synthetic default export by explicitly declaring no default
  const _noDefaultExport: never;
  export default _noDefaultExport;
}
