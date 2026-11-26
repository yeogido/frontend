export interface UserLocation {
  readonly latitude: number;
  readonly longitude: number;
}

const USER_LOCATION_STORAGE_KEY = 'yeogido:user-location';
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function isUserLocation(value: unknown): value is UserLocation {
  if (!value || typeof value !== 'object') return false;

  const { latitude, longitude } = value as UserLocation;
  return Number.isFinite(latitude) && Number.isFinite(longitude);
}

const EARTH_RADIUS_KM = 6371;

/** 두 좌표 사이의 직선거리(km). */
export function getDistanceKm(from: UserLocation, to: UserLocation): number {
  const toRadians = (degree: number) => (degree * Math.PI) / 180;
  const latitudeGap = toRadians(to.latitude - from.latitude);
  const longitudeGap = toRadians(to.longitude - from.longitude);
  const haversine =
    Math.sin(latitudeGap / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(longitudeGap / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

export function readStoredUserLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawLocation = window.sessionStorage.getItem(
      USER_LOCATION_STORAGE_KEY
    );
    if (!rawLocation) return null;

    const location: unknown = JSON.parse(rawLocation);
    return isUserLocation(location) ? location : null;
  } catch {
    return null;
  }
}

export function storeUserLocation(location: UserLocation): void {
  if (typeof window === 'undefined' || !isUserLocation(location)) return;

  try {
    window.sessionStorage.setItem(
      USER_LOCATION_STORAGE_KEY,
      JSON.stringify(location)
    );
  } catch {
    // Private browsing or storage restrictions should not prevent location use.
  }
}

export async function getGeolocationPermission(): Promise<PermissionState | null> {
  if (typeof navigator === 'undefined' || !navigator.permissions) return null;

  try {
    const permission = await navigator.permissions.query({
      name: 'geolocation',
    });
    return permission.state;
  } catch {
    return null;
  }
}

export function requestUserLocation(): Promise<UserLocation | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        storeUserLocation(location);
        resolve(location);
      },
      () => resolve(null),
      GEOLOCATION_OPTIONS
    );
  });
}

export async function resolveUserLocation(): Promise<UserLocation | null> {
  const permission = await getGeolocationPermission();
  if (permission === 'denied') return null;

  return requestUserLocation();
}
