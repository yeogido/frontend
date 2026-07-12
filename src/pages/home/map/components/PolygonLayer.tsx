import { geoMercator, geoPath } from 'd3-geo';

import koreaCityJson from '../assets/korea-city.json';

import type { KoreaCityGeoJson } from '../types/map';

const koreaCity = koreaCityJson as KoreaCityGeoJson;

function PolygonLayer() {
  const projection = geoMercator()
    .center([127.8, 36.2])
    .scale(4500)
    .translate([200, 300]);

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

export default PolygonLayer;