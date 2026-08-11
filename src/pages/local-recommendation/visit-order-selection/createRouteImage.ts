import { loadKakaoMapsSdk } from '../../../components/kakaomap/utils/kakaoMap';
import type { VisitEvent } from './constants';
import {
  resolveVisitEventGeoPoints,
  TRAVEL_DATA_TIMEOUT_MS,
} from './useVisitEventTravelData';

const IMAGE_WIDTH = 680;
const IMAGE_HEIGHT = 460;
const DEFAULT_MAP_LEVEL = 5;
const ROUTE_COLOR = '#ff6f41';
const MARKER_SIZE = 110;
const MARKER_RADIUS = 12;
const MAP_READY_TIMEOUT_MS = 2_000;
const IMAGE_LOAD_TIMEOUT_MS = 8_000;

type CapturableMap = kakao.maps.Map & {
  getCenter(): { getLat(): number; getLng(): number };
  getLevel(): number;
  getProjection(): {
    containerPointFromCoords(latLng: kakao.maps.LatLng): { x: number; y: number };
  };
};

function waitForMapIdle(map: kakao.maps.Map): Promise<void> {
  return new Promise((resolve) => {
    let completed = false;
    const complete = () => {
      if (completed) return;
      completed = true;
      clearTimeout(timeoutId);
      resolve();
    };
    const eventApi = window.kakao.maps.event as unknown as {
      addListener(target: kakao.maps.Map, type: 'idle', handler: () => void): void;
    };
    const timeoutId = window.setTimeout(complete, MAP_READY_TIMEOUT_MS);
    eventApi.addListener(map, 'idle', complete);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timeoutId = window.setTimeout(() => {
      image.src = '';
      reject(new Error('Timed out while loading a route image.'));
    }, IMAGE_LOAD_TIMEOUT_MS);
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      clearTimeout(timeoutId);
      resolve(image);
    };
    image.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load a route marker image.'));
    };
    image.src = source;
  });
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create the route image.'));
    }, 'image/png');
  });
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function drawFallbackMarker(
  context: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  drawRoundedRect(
    context,
    x - MARKER_SIZE / 2,
    y - MARKER_SIZE / 2,
    MARKER_SIZE,
    MARKER_SIZE,
    MARKER_RADIUS
  );
  context.fillStyle = ROUTE_COLOR;
  context.fill();
}

async function drawImageMarker(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  imageSource: string
) {
  try {
    const image = await loadImage(imageSource);
    const left = x - MARKER_SIZE / 2;
    const top = y - MARKER_SIZE / 2;

    context.save();
    drawRoundedRect(
      context,
      left,
      top,
      MARKER_SIZE,
      MARKER_SIZE,
      MARKER_RADIUS
    );
    context.clip();
    context.drawImage(image, left, top, MARKER_SIZE, MARKER_SIZE);
    context.restore();

    drawRoundedRect(
      context,
      left,
      top,
      MARKER_SIZE,
      MARKER_SIZE,
      MARKER_RADIUS
    );
    context.lineWidth = 4;
    context.strokeStyle = ROUTE_COLOR;
    context.stroke();
  } catch {
    drawFallbackMarker(context, x, y);
    return;
  }
}

async function fetchStaticMap(
  center: string,
  level: number,
  signal: AbortSignal
): Promise<HTMLImageElement> {
  const params = new URLSearchParams({
    center,
    size: `${IMAGE_WIDTH}x${IMAGE_HEIGHT}`,
    lv: String(level),
  });
  const response = await fetch(`/kakao-maps/static-map?${params}`, { signal });
  if (!response.ok) throw new Error('Failed to load the route map.');

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    return await loadImage(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function createRouteImage(
  visitEvents: readonly VisitEvent[]
): Promise<File> {
  const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
  if (!apiKey) throw new Error('Kakao Map API is not configured.');

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    TRAVEL_DATA_TIMEOUT_MS
  );

  try {
    const pointsByEventId = await resolveVisitEventGeoPoints(
      visitEvents,
      controller.signal
    );
    const routeEvents = visitEvents.flatMap((event) => {
      const point = pointsByEventId.get(event.id);
      return point ? [{ event, point }] : [];
    });
    if (routeEvents.length === 0) {
      throw new Error('No locations are available for the route image.');
    }

    await loadKakaoMapsSdk(apiKey);
    const mapContainer = document.createElement('div');
    mapContainer.style.cssText = `position:fixed;left:-10000px;top:0;width:${IMAGE_WIDTH}px;height:${IMAGE_HEIGHT}px;opacity:0;pointer-events:none;`;
    document.body.append(mapContainer);

    try {
    const firstPoint = routeEvents[0].point;
    const map = new window.kakao.maps.Map(mapContainer, {
      center: new window.kakao.maps.LatLng(firstPoint.latitude, firstPoint.longitude),
      level: DEFAULT_MAP_LEVEL,
    }) as CapturableMap;

    if (routeEvents.length > 1) {
      const bounds = new window.kakao.maps.LatLngBounds();
      routeEvents.forEach(({ point }) => {
        bounds.extend(new window.kakao.maps.LatLng(point.latitude, point.longitude));
      });
      map.setBounds(bounds);
    }
    await waitForMapIdle(map);

    const center = map.getCenter();
    const background = await fetchStaticMap(
      `${center.getLng()},${center.getLat()}`,
      map.getLevel(),
      controller.signal
    );
    const canvas = document.createElement('canvas');
    canvas.width = IMAGE_WIDTH;
    canvas.height = IMAGE_HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to prepare the route image.');

    context.drawImage(background, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    const projection = map.getProjection();
    const canvasPoints = routeEvents.map(({ point }) => {
      const pixel = projection.containerPointFromCoords(
        new window.kakao.maps.LatLng(point.latitude, point.longitude)
      );
      return { x: pixel.x, y: pixel.y };
    });

    if (canvasPoints.length > 1) {
      context.beginPath();
      context.moveTo(canvasPoints[0].x, canvasPoints[0].y);
      canvasPoints.slice(1).forEach(({ x, y }) => context.lineTo(x, y));
      context.setLineDash([12, 10]);
      context.lineWidth = 6;
      context.lineCap = 'round';
      context.strokeStyle = ROUTE_COLOR;
      context.stroke();
      context.setLineDash([]);
    }

    await Promise.all(
      routeEvents.map(({ event }, index) =>
        drawImageMarker(
          context,
          canvasPoints[index].x,
          canvasPoints[index].y,
          event.imageSrc
        )
      )
    );

    const blob = await canvasBlob(canvas);
    return new File([blob], 'course-route.png', { type: 'image/png' });
    } finally {
      mapContainer.remove();
    }
  } finally {
    window.clearTimeout(timeoutId);
  }
}
