import type { GeoPoint } from '../components/kakaomap/types';

/** 서버 프록시를 사용하며 앱 키는 클라이언트에 노출하지 않는다. */
export async function fetchTmapWalkingDurationMinutes(
  start: GeoPoint,
  end: GeoPoint,
  signal?: AbortSignal
): Promise<number | null> {
  const params = new URLSearchParams({
    origin: `${start.longitude},${start.latitude}`,
    destination: `${end.longitude},${end.latitude}`,
  });
  const response = await fetch(`/tmap-routing/walk?${params}`, { signal });
  if (response.status === 503) return null;
  if (!response.ok) throw new Error('Failed to request TMAP walking duration.');

  const data = (await response.json()) as { durationSeconds?: number | null };
  const seconds = data.durationSeconds;
  return typeof seconds === 'number' && Number.isFinite(seconds) && seconds >= 0
    ? Math.ceil(seconds / 60)
    : null;
}
