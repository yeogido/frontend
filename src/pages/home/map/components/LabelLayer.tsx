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

import koreaCityJson from '../assets/korea-city.json';
import koreaProvinceJson from '../assets/korea-province.json';

const MAP_PADDING = 20;

interface LabelLayerProps {
  zoomLevel: number;
  renderScale: number;
}

interface LabelCandidate {
  index: number;
  x: number;
  y: number;
  name: string;
  area: number;
  fontSize: number;
}

// 대략적인 한글 라벨의 가로 폭 추정치 (글자 하나당 폰트 크기의 약 0.95배)
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
  // 면적이 큰 지역(=더 중요한 지역)의 라벨을 우선 배치
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

function LabelLayer({ zoomLevel, renderScale }: LabelLayerProps) {
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

  // 서울특별시 라벨 전용
  const seoulLabelPosition = useMemo(() => {
    const provinceGeoJson =
      koreaProvinceJson as GeoJSON.FeatureCollection;

    const seoulFeature = provinceGeoJson.features.find(
      (feature) =>
        (feature.properties as { name?: string } | null)?.name ===
        '서울특별시',
    );

    if (!seoulFeature) return null;

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

    const [x, y] = provincePath.centroid(seoulFeature);

    const offset = LABEL_OFFSETS['서울특별시'];

    return offset
      ? [x + offset.x, y + offset.y]
      : [x, y];
  }, []);

  const visibleLabels = useMemo(() => {
    const candidates: LabelCandidate[] = [];
    
    if (isCity && seoulLabelPosition) {
      candidates.push({
        index: -1,
        x: seoulLabelPosition[0],
        y: seoulLabelPosition[1],
        name: '서울특별시',
        area: Number.MAX_SAFE_INTEGER,
        fontSize: fontSize * 1.4,
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

      const isSeoulDistrict =
        properties?.code?.startsWith('11') ?? false;

      if (isCity && isSeoulDistrict) return;

      const offset = LABEL_OFFSETS[name];

      if (offset) {
        x += offset.x;
        y += offset.y;
      }

      const area = pathGenerator.area(feature);

      candidates.push({
        index,
        x,
        y,
        name,
        area,
        fontSize,
      });
    });

    return pickNonOverlappingLabels(candidates);
  }, [
    geoJson,
    pathGenerator,
    isCity,
    fontSize,
    seoulLabelPosition,
  ]);
  return (
    <>
      {visibleLabels.map(
        ({ index, x, y, name, fontSize: size }) => (
          <text
            key={index}
            x={x}
            y={y}
            fontSize={size}
            fontWeight={600}
            fill="#FF6F41"
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