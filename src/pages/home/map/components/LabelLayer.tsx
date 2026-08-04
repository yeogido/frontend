import { useMemo } from 'react';

import { geoMercator, geoPath, type GeoPath } from 'd3-geo';

import {
  CITY_LABEL_FONT_SIZE,
  CITY_LAYER_ZOOM,
  MAP_VIEWBOX_HEIGHT,
  MAP_VIEWBOX_WIDTH,
  PROVINCE_LABEL_FONT_SIZE,
} from '../constants/map';
import { LABEL_OFFSETS } from '../constants/labelOffsets';
import { toRegionLabel } from '../constants/regionLabels';
import {
  METRO_PROVINCE_CODES,
  isMetroCityCode,
} from '../utils/metroCityCodes';
import {
  findPoleOfInaccessibility,
  signedDistanceToPolygon,
  type ProjectedRing,
} from '../utils/labelAnchor';

import { koreaCity } from '../assets/koreaCity';
import { koreaProvince } from '../assets/koreaProvince';

import type { RegionPhotoMap } from '../types/regionPhoto';

const MAP_PADDING = 20;

const LABEL_COLOR = '#FF6F41';
/** 사진이 채워진 지역은 스크림 위에 얹히므로 흰 글씨를 쓴다. theme의 --color-white */
const PHOTO_LABEL_COLOR = '#F9F9F9';
/** 디자인(Figma) 기준 */
const LABEL_FONT_WEIGHT = 500;

/**
 * 도 단위가 보이는 축소 상태에서는 사진 유무와 관계없이 기본색으로
 * 통일한다. 시/군까지 보이는 확대 상태에서만 사진 위 글씨를 흰색으로
 * 바꾼다.
 */
function getLabelColor(isProvinceZoom: boolean, hasPhoto: boolean) {
  if (isProvinceZoom) {
    return LABEL_COLOR;
  }

  return hasPhoto ? PHOTO_LABEL_COLOR : LABEL_COLOR;
}

interface LabelLayerProps {
  zoomLevel: number;
  renderScale: number;
  regionPhotos: RegionPhotoMap;
}

interface LabelCandidate {
  index: number;
  x: number;
  y: number;
  name: string;
  area: number;
  fontSize: number;
  hasPhoto: boolean;
}

const LABEL_CHAR_WIDTH_RATIO = 0.95;
const LABEL_LINE_HEIGHT_RATIO = 1.3;
/** 광역시 라벨은 도 단위 이름이라 조금 크게 쓴다. */
const METRO_LABEL_SCALE = 1.4;
/** 도형에서 글씨가 차지해도 되는 비율. 나머지는 여백으로 남긴다. */
const LABEL_FIT_RATIO = 0.85;
/** 기본 크기의 이 비율보다 더 줄여야 들어가는 지역은 라벨을 접는다. */
const MIN_LABEL_SCALE = 0.55;

function estimateLabelWidth(text: string, fontSize: number) {
  return text.length * fontSize * LABEL_CHAR_WIDTH_RATIO;
}

/**
 * 도형 안에 글씨가 들어가도록 크기를 줄인다.
 *
 * 바운딩 박스만 보면 오목한 도형에서 글씨가 경계 밖으로 새어 나간다.
 * 라벨 사각형이 최대내접원 안에 들어가는지도 함께 보면, 도형이 어떻게
 * 생겼든 글씨가 안쪽에 머문다. 너무 많이 줄여야 하면 알아보지 못할
 * 크기가 되므로 그리지 않고 접는다(null).
 */
function fitLabelFontSize(
  text: string,
  fontSize: number,
  [[x0, y0], [x1, y1]]: [[number, number], [number, number]],
  inscribedRadius: number,
) {
  const limitByWidth =
    ((x1 - x0) * LABEL_FIT_RATIO) / (text.length * LABEL_CHAR_WIDTH_RATIO);
  const limitByHeight =
    ((y1 - y0) * LABEL_FIT_RATIO) / LABEL_LINE_HEIGHT_RATIO;
  // 라벨 사각형의 반대각선이 내접원 반지름을 넘지 않아야 한다.
  const limitByRadius =
    inscribedRadius /
    Math.hypot(
      (text.length * LABEL_CHAR_WIDTH_RATIO) / 2,
      LABEL_LINE_HEIGHT_RATIO / 2,
    );
  const fitted = Math.min(
    fontSize,
    limitByWidth,
    limitByHeight,
    limitByRadius,
  );

  return fitted >= fontSize * MIN_LABEL_SCALE ? fitted : null;
}

/**
 * 라벨을 놓을 자리와 크기를 잴 기준 도형.
 *
 * 섬이 흩어진 지역은 전체 무게중심이 섬 사이 바다에 찍히고, 전체
 * 바운딩 박스도 실제 육지보다 훨씬 커진다. 가장 큰 조각을 기준으로
 * 삼아야 글씨가 육지 위에 놓이고 크기도 그 육지에 맞는다.
 */
function getLabelShape(feature: GeoJSON.Feature, path: GeoPath) {
  const { geometry } = feature;

  if (geometry.type !== 'MultiPolygon' || geometry.coordinates.length < 2) {
    return feature;
  }

  return geometry.coordinates
    .map((coordinates): GeoJSON.Polygon => ({
      type: 'Polygon',
      coordinates,
    }))
    .reduce((largest, polygon) =>
      path.area(polygon) > path.area(largest) ? polygon : largest,
    );
}

type Project = (point: [number, number]) => [number, number] | null;

const toProjectedRings = (
  shape: GeoJSON.Feature | GeoJSON.Polygon,
  project: Project,
): ProjectedRing[] => {
  const geometry = shape.type === 'Feature' ? shape.geometry : shape;
  const polygons =
    geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.type === 'MultiPolygon'
        ? geometry.coordinates
        : [];

  return polygons.flatMap((polygon) =>
    polygon.map((ring) =>
      ring
        .map((point) => project(point as [number, number]))
        .filter((point): point is [number, number] => point !== null),
    ),
  );
};

/**
 * 라벨을 놓을 좌표와, 그 지점에서 경계까지의 여유(내접원 반지름).
 *
 * 무게중심은 도형이 오목하면 경계 밖으로 나가고, 안에 있더라도 여유가
 * 거의 없어 글씨가 삐져나온다. 통영·남해·무안처럼 해안이 굽은 지역이나,
 * 군위를 편입해 길어진 대구가 그렇다. 최대내접원의 중심은 정의상 경계
 * 에서 가장 먼 지점이라 항상 안쪽이고 여유도 가장 크다.
 */
function resolveLabelAnchor(
  shape: GeoJSON.Feature | GeoJSON.Polygon,
  path: GeoPath,
  project: Project,
): { x: number; y: number; radius: number } | null {
  const rings = toProjectedRings(shape, project);
  const pole = findPoleOfInaccessibility(rings);

  if (pole) {
    return pole;
  }

  // 극점을 못 찾는 아주 작은 도형은 무게중심으로 되돌린다.
  const [centroidX, centroidY] = path.centroid(shape);

  if (Number.isNaN(centroidX) || Number.isNaN(centroidY)) {
    return null;
  }

  return {
    x: centroidX,
    y: centroidY,
    radius: Math.max(
      signedDistanceToPolygon(centroidX, centroidY, rings),
      0,
    ),
  };
}

function isOverlapping(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function pickNonOverlappingLabels(
  candidates: LabelCandidate[],
): LabelCandidate[] {
  const sorted = [...candidates].sort((a, b) => b.area - a.area);

  const placedRects: { x: number; y: number; w: number; h: number }[] = [];
  const accepted: LabelCandidate[] = [];

  for (const candidate of sorted) {
    const w = estimateLabelWidth(candidate.name, candidate.fontSize);
    const h = candidate.fontSize * 1.3;

    const rect = {
      x: candidate.x - w / 2,
      y: candidate.y - h / 2,
      w,
      h,
    };

    const overlaps = placedRects.some((placed) =>
      isOverlapping(rect, placed),
    );

    if (!overlaps) {
      placedRects.push(rect);
      accepted.push(candidate);
    }
  }

  return accepted;
}

function LabelLayer({
  zoomLevel,
  renderScale,
  regionPhotos,
}: LabelLayerProps) {
  const isCity = useMemo(
    () => zoomLevel >= CITY_LAYER_ZOOM,
    [zoomLevel],
  );

  const geoJson = useMemo(
    () =>
      isCity
        ? (koreaCity as GeoJSON.FeatureCollection)
        : (koreaProvince as GeoJSON.FeatureCollection),
    [isCity],
  );

  const projection = useMemo(
    () =>
      geoMercator().fitExtent(
        [
          [MAP_PADDING, MAP_PADDING],
          [
            MAP_VIEWBOX_WIDTH - MAP_PADDING,
            MAP_VIEWBOX_HEIGHT - MAP_PADDING,
          ],
        ],
        geoJson,
      ),
    [geoJson],
  );

  const pathGenerator: GeoPath = useMemo(
    () => geoPath(projection),
    [projection],
  );

  // 확대해도 화면상 글씨 크기가 일정하게 유지되도록 renderScale로 나눈다.
  const fontSize = useMemo(() => {
    const base = isCity
      ? CITY_LABEL_FONT_SIZE
      : PROVINCE_LABEL_FONT_SIZE;

    return Math.max(base / renderScale, 1.5);
  }, [isCity, renderScale]);

  // 광역시/특별시 전용 라벨: 구 단위 대신 도 단위(하나로 합쳐진) 이름 하나만 표시
  const metroLabelPositions = useMemo(() => {
    const provinceGeoJson = koreaProvince as GeoJSON.FeatureCollection;

    const provinceProjection = geoMercator().fitExtent(
      [
        [MAP_PADDING, MAP_PADDING],
        [
          MAP_VIEWBOX_WIDTH - MAP_PADDING,
          MAP_VIEWBOX_HEIGHT - MAP_PADDING,
        ],
      ],
      provinceGeoJson,
    );

    const provincePath = geoPath(provinceProjection);

    return provinceGeoJson.features
      .filter((feature) => {
        const properties = feature.properties as {
          code?: string;
        } | null;

        return (
          properties?.code && METRO_PROVINCE_CODES.has(properties.code)
        );
      })
      .map((feature) => {
        const properties = feature.properties as {
          name?: string;
        } | null;

        const name = properties?.name ?? '';
        const shape = getLabelShape(feature, provincePath);
        const anchor = resolveLabelAnchor(
          shape,
          provincePath,
          provinceProjection,
        );

        if (!anchor) return null;

        const offset = LABEL_OFFSETS[name];

        return {
          name,
          x: offset ? anchor.x + offset.x : anchor.x,
          y: offset ? anchor.y + offset.y : anchor.y,
          bounds: provincePath.bounds(shape),
          radius: anchor.radius,
        };
      })
      .filter((metro): metro is NonNullable<typeof metro> => metro !== null);
  }, []);

  /**
   * 좌표와 도형 크기는 줌과 무관하다(줌은 SVG transform으로만 걸린다).
   * 최대내접원 계산이 무거우므로 글씨 크기 변화와 분리해 둔다.
   */
  const labelShapes = useMemo(
    () =>
      geoJson.features
        .map((feature, index) => {
          const properties = feature.properties as {
            code?: string;
            name?: string;
          } | null;

          const name = properties?.name ?? '';
          const shape = getLabelShape(feature, pathGenerator);
          const anchor = resolveLabelAnchor(shape, pathGenerator, projection);

          if (!anchor) return null;

          const offset = LABEL_OFFSETS[name];

          return {
            index,
            name,
            code: properties?.code,
            x: offset ? anchor.x + offset.x : anchor.x,
            y: offset ? anchor.y + offset.y : anchor.y,
            bounds: pathGenerator.bounds(shape),
            radius: anchor.radius,
            area: pathGenerator.area(feature),
          };
        })
        .filter((shape): shape is NonNullable<typeof shape> => shape !== null),
    [geoJson, pathGenerator, projection],
  );

  const visibleLabels = useMemo(() => {
    const candidates: LabelCandidate[] = [];

    if (isCity) {
      metroLabelPositions.forEach((metro, i) => {
        const label = toRegionLabel(metro.name);
        const fittedFontSize = fitLabelFontSize(
          label,
          fontSize * METRO_LABEL_SCALE,
          metro.bounds,
          metro.radius,
        );

        if (fittedFontSize === null) return;

        candidates.push({
          index: -(i + 1),
          x: metro.x,
          y: metro.y,
          name: label,
          area: Number.MAX_SAFE_INTEGER,
          fontSize: fittedFontSize,
          hasPhoto: Boolean(regionPhotos[metro.name]),
        });
      });
    }

    labelShapes.forEach(({ index, name, code, x, y, bounds, radius, area }) => {
      // 광역시/특별시 소속 구 라벨은 표시하지 않는다.
      // (해당 지역은 metroLabelPositions로 이미 하나의 라벨만 표시됨)
      if (isCity && isMetroCityCode(code)) return;

      // regionPhotos는 GeoJSON 이름을 키로 쓰므로, 표시용 이름으로
      // 바꾸는 건 마지막에 한 번만 한다.
      const label = toRegionLabel(name);
      const fittedFontSize = fitLabelFontSize(
        label,
        fontSize,
        bounds,
        radius,
      );

      if (fittedFontSize === null) return;

      candidates.push({
        index,
        x,
        y,
        name: label,
        area,
        fontSize: fittedFontSize,
        hasPhoto: Boolean(regionPhotos[name]),
      });
    });

    return pickNonOverlappingLabels(candidates);
  }, [labelShapes, isCity, fontSize, metroLabelPositions, regionPhotos]);

  return (
    <>
      {visibleLabels.map(
        ({ index, x, y, name, fontSize: size, hasPhoto }) => (
          <text
            key={index}
            x={x}
            y={y}
            fontSize={size}
            fontWeight={LABEL_FONT_WEIGHT}
            fill={getLabelColor(!isCity, hasPhoto)}
            textAnchor="middle"
            dominantBaseline="middle"
            pointerEvents="none"
          >
            {name}
          </text>
        ),
      )}
    </>
  );
}

export default LabelLayer;