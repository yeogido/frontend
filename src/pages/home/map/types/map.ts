import type {
  Feature,
  FeatureCollection,
  Geometry,
} from 'geojson';

export interface KoreaCityProperties {
  code: string;
  name: string;
}

export type KoreaCityFeature = Feature<
  Geometry,
  KoreaCityProperties
>;

export type KoreaCityGeoJson = FeatureCollection<
  Geometry,
  KoreaCityProperties
>;