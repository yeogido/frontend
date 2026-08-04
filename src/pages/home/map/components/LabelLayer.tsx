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

import koreaCityJson from '../assets/korea-city.json';
import koreaProvinceJson from '../assets/korea-province.json';

import type { RegionPhotoMap } from '../types/regionPhoto';

const MAP_PADDING = 20;

const LABEL_COLOR = '#FF6F41';
/** 사진이 채워진 지역은 스크림 위에 얹히므로 흰 글씨를 쓴다. */
const PHOTO_LABEL_COLOR = '#FFFFFF';

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

function estimateLabelWidth(text: string, fontSize: number) {
  return text.length * fontSize * 0.95;
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
        ? (koreaCityJson as GeoJSON.FeatureCollection)
        : (koreaProvinceJson as GeoJSON.FeatureCollection),
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
    const provinceGeoJson =
      koreaProvinceJson as GeoJSON.FeatureCollection;

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
        const [x, y] = provincePath.centroid(feature);
        const offset = LABEL_OFFSETS[name];

        return {
          name,
          x: offset ? x + offset.x : x,
          y: offset ? y + offset.y : y,
        };
      });
  }, []);

  const visibleLabels = useMemo(() => {
    const candidates: LabelCandidate[] = [];

    if (isCity) {
      metroLabelPositions.forEach((metro, i) => {
        candidates.push({
          index: -(i + 1),
          x: metro.x,
          y: metro.y,
          name: toRegionLabel(metro.name),
          area: Number.MAX_SAFE_INTEGER,
          fontSize: fontSize * 1.4,
          hasPhoto: Boolean(regionPhotos[metro.name]),
        });
      });
    }

    geoJson.features.forEach((feature, index) => {
      let [x, y] = pathGenerator.centroid(feature);

      if (Number.isNaN(x) || Number.isNaN(y)) return;

      const properties = feature.properties as {
        code?: string;
        name?: string;
      } | null;

      const name = properties?.name ?? '';

      // 광역시/특별시 소속 구 라벨은 표시하지 않는다.
      // (해당 지역은 metroLabelPositions로 이미 하나의 라벨만 표시됨)
      if (isCity && isMetroCityCode(properties?.code)) return;

      const offset = LABEL_OFFSETS[name];

      if (offset) {
        x += offset.x;
        y += offset.y;
      }

      const area = pathGenerator.area(feature);

      // LABEL_OFFSETS는 GeoJSON 이름을 키로 쓰므로, 표시용 이름으로
      // 바꾸는 건 마지막에 한 번만 한다.
      candidates.push({
        index,
        x,
        y,
        name: toRegionLabel(name),
        area,
        fontSize,
        hasPhoto: Boolean(regionPhotos[name]),
      });
    });

    return pickNonOverlappingLabels(candidates);
  }, [
    geoJson,
    pathGenerator,
    isCity,
    fontSize,
    metroLabelPositions,
    regionPhotos,
  ]);

  return (
    <>
      {visibleLabels.map(
        ({ index, x, y, name, fontSize: size, hasPhoto }) => (
          <text
            key={index}
            x={x}
            y={y}
            fontSize={size}
            fontWeight={600}
            fill={hasPhoto ? PHOTO_LABEL_COLOR : LABEL_COLOR}
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