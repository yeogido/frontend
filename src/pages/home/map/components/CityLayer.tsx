import { geoMercator, geoPath } from 'd3-geo';

import { CITY_LAYER_ZOOM } from '../constants/map';
import { isMetroCityCode } from '../utils/metroCityCodes';

import koreaCityJson from '../assets/korea-city.json';

import type { KoreaCityGeoJson } from '../types/map';

const koreaCity = koreaCityJson as KoreaCityGeoJson;

const MAP_WIDTH = 400;
const MAP_HEIGHT = 600;
const MAP_PADDING = 20;

interface CityLayerProps {
  zoomLevel: number;
}

function CityLayer({ zoomLevel }: CityLayerProps) {
  const projection = geoMercator().fitExtent(
    [
      [MAP_PADDING, MAP_PADDING],
      [MAP_WIDTH - MAP_PADDING, MAP_HEIGHT - MAP_PADDING],
    ],
    koreaCity,
  );

  const pathGenerator = geoPath(projection);

  const isVisible = zoomLevel >= CITY_LAYER_ZOOM;

  return (
    <>
      {koreaCity.features.map((feature, index) => {
        const properties = feature.properties as {
          code?: string;
        } | null;

        // 광역시/특별시 소속 구(74개)는 세부 경계선을 그리지 않는다.
        // 그 결과 밑에 항상 그려져 있는 ProvinceLayer의 도 단위
        // 통짜 경계선만 남아, 구 구분 없이 하나로 뭉쳐 보인다.
        if (isMetroCityCode(properties?.code)) {
          return null;
        }

        const d = pathGenerator(feature);

        if (!d) return null;

        return (
          <path
            key={index}
            d={d}
            fill="none"
            stroke="#FF6F41"
            strokeWidth={0.5}
            strokeOpacity={isVisible ? 1 : 0}
            pointerEvents="none"
          />
        );
      })}
    </>
  );
}

export default CityLayer;