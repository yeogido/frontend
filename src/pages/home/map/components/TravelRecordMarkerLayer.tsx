import { useMemo } from 'react';

import { geoMercator, geoPath } from 'd3-geo';

import {
  MAP_VIEWBOX_HEIGHT,
  MAP_VIEWBOX_WIDTH,
} from '../constants/map';

import koreaCityJson from '../assets/korea-city.json';

import type { KoreaCityGeoJson, MapMarker } from '../types/map';

const MAP_PADDING = 20;
const koreaCity = koreaCityJson as KoreaCityGeoJson;

interface TravelRecordMarkerLayerProps {
  markers: readonly MapMarker[];
  renderScale: number;
}

function TravelRecordMarkerLayer({
  markers,
  renderScale,
}: TravelRecordMarkerLayerProps) {
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
        koreaCity,
      ),
    [],
  );

  const pathGenerator = useMemo(
    () => geoPath(projection),
    [projection],
  );

  const visibleMarkers = useMemo(
    () =>
      markers
        .map((marker) => {
          const feature = koreaCity.features.find(
            ({ properties }) => properties.code === marker.regionCode,
          );

          if (!feature) return null;

          const [x, y] = pathGenerator.centroid(feature);

          if (Number.isNaN(x) || Number.isNaN(y)) return null;

          return {
            ...marker,
            x,
            y,
          };
        })
        .filter((marker) => marker !== null),
    [markers, pathGenerator],
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
