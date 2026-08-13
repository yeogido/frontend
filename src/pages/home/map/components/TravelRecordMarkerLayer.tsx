import { useMemo } from 'react';

import { geoMercator, geoPath } from 'd3-geo';

import {
  MAP_VIEWBOX_HEIGHT,
  MAP_VIEWBOX_WIDTH,
} from '../constants/map';

import { koreaCity } from '../assets/koreaCity';
import { koreaProvince } from '../assets/koreaProvince';

import type { MapMarker } from '../types/map';

const MAP_PADDING = 20;
const mapExtent: [[number, number], [number, number]] = [
  [MAP_PADDING, MAP_PADDING],
  [MAP_VIEWBOX_WIDTH - MAP_PADDING, MAP_VIEWBOX_HEIGHT - MAP_PADDING],
];

interface TravelRecordMarkerLayerProps {
  markers: readonly MapMarker[];
  renderScale: number;
}

function TravelRecordMarkerLayer({
  markers,
  renderScale,
}: TravelRecordMarkerLayerProps) {
  const cityProjection = useMemo(
    () => geoMercator().fitExtent(mapExtent, koreaCity),
    [],
  );
  const provinceProjection = useMemo(
    () => geoMercator().fitExtent(mapExtent, koreaProvince),
    [],
  );

  const cityPathGenerator = useMemo(
    () => geoPath(cityProjection),
    [cityProjection],
  );
  const provincePathGenerator = useMemo(
    () => geoPath(provinceProjection),
    [provinceProjection],
  );

  const visibleMarkers = useMemo(
    () =>
      markers
        .map((marker) => {
          // 시/군/구 도형(4자리 코드) 우선 매칭, 없으면 광역시/도 도형
          // (2자리 코드, 예: 광역시 전체)으로 매칭한다.
          const cityFeature = koreaCity.features.find(
            ({ properties }) => properties.code === marker.regionCode,
          );

          const [x, y] = cityFeature
            ? cityPathGenerator.centroid(cityFeature)
            : (() => {
                const provinceFeature = koreaProvince.features.find(
                  (feature) =>
                    (feature.properties as { code?: string } | null)
                      ?.code === marker.regionCode,
                );

                return provinceFeature
                  ? provincePathGenerator.centroid(provinceFeature)
                  : [Number.NaN, Number.NaN];
              })();

          if (Number.isNaN(x) || Number.isNaN(y)) return null;

          return {
            ...marker,
            x,
            y,
          };
        })
        .filter((marker) => marker !== null),
    [markers, cityPathGenerator, provincePathGenerator],
  );

  const radius = Math.max(11 / renderScale, 3.6);
  const fontSize = Math.max(10 / renderScale, 3.2);
  const strokeWidth = Math.max(2 / renderScale, 0.7);

  return (
    <>
      {visibleMarkers.map(({ regionCode, regionName, count, x, y }) => (
        <g
          key={regionCode}
          transform={`translate(${x} ${y})`}
          pointerEvents="none"
        >
          <title>{`${regionName} 여행 기록 ${count}개`}</title>
          <circle
            r={radius}
            fill="#FF6F41"
            stroke="#F9F9F9"
            strokeWidth={strokeWidth}
          />
          <text
            y={fontSize * 0.08}
            fill="#F9F9F9"
            fontSize={fontSize}
            fontWeight={700}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {count}
          </text>
        </g>
      ))}
    </>
  );
}

export default TravelRecordMarkerLayer;
