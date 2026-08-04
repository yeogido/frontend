export interface GeoPoint {
  readonly latitude: number;
  readonly longitude: number;
}

export function isValidGeoPoint(point?: GeoPoint | null): point is GeoPoint {
  return (
    Boolean(point) &&
    typeof point?.latitude === 'number' &&
    typeof point?.longitude === 'number' &&
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude)
  );
}
