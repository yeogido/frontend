import type {
  Feature,
  FeatureCollection,
  Geometry,
} from 'geojson';

export type KoreaCityFeature = Feature<Geometry>;

export type KoreaCityGeoJson = FeatureCollection<Geometry>;