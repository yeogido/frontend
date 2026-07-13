import { useMemo } from 'react';

import { geoMercator, geoPath } from 'd3-geo';

import {
  CITY_LAYER_ZOOM,
  MAP_VIEWBOX_HEIGHT,
  MAP_VIEWBOX_WIDTH,
} from '../constants/map';

import koreaCityJson from '../assets/korea-city.json';
import koreaProvinceJson from '../assets/korea-province.json';

const MAP_PADDING = 20;

interface LabelLayerProps {
  zoomLevel: number;
}

function LabelLayer({ zoomLevel }: LabelLayerProps) {
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

  const pathGenerator = useMemo(
    () => geoPath(projection),
    [projection],
  );

  return (
    <>
      {geoJson.features.map((feature, index) => {
        const [x, y] = pathGenerator.centroid(feature);

        if (Number.isNaN(x) || Number.isNaN(y)) return null;

        return (
          <text
            key={index}
            x={x}
            y={y}
            fontSize={isCity ? 4 : 8}
            fontWeight={600}
            fill="#404040"
            textAnchor="middle"
            dominantBaseline="middle"
            pointerEvents="none"
          >
            {(feature.properties as { name?: string } | null)?.name ?? ''}
          </text>
        );
      })}
    </>
  );
}

export default LabelLayer;