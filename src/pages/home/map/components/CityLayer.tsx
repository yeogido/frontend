import { geoMercator, geoPath } from 'd3-geo';

import { CITY_LAYER_ZOOM } from '../constants/map';

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