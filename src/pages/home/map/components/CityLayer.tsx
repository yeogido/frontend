import { geoMercator, geoPath } from 'd3-geo';

import koreaCityJson from '../assets/korea-city.json';

import type { KoreaCityGeoJson } from '../types/map';

const koreaCity = koreaCityJson as KoreaCityGeoJson;

const MAP_WIDTH = 400;
const MAP_HEIGHT = 600;
const MAP_PADDING = 20;

function CityLayer() {
  const projection = geoMercator().fitExtent(
    [
      [MAP_PADDING, MAP_PADDING],
      [MAP_WIDTH - MAP_PADDING, MAP_HEIGHT - MAP_PADDING],
    ],
    koreaCity,
  );

  const pathGenerator = geoPath(projection);

  return (
    <>
      {koreaCity.features.map((feature, index) => {
        const d = pathGenerator(feature);

        if (!d) return null;

        return (
          <path
            key={index}
            d={d}
            fill="#F8F8F8"
            stroke="#D9D9D9"
            strokeWidth={0.5}
          />
        );
      })}
    </>
  );
}

export default CityLayer;