import { geoMercator, geoPath } from 'd3-geo';

import koreaProvinceJson from '../assets/korea-province.json';

const MAP_WIDTH = 400;
const MAP_HEIGHT = 600;
const MAP_PADDING = 20;

function ProvinceLayer() {
  const projection = geoMercator().fitExtent(
    [
      [MAP_PADDING, MAP_PADDING],
      [MAP_WIDTH - MAP_PADDING, MAP_HEIGHT - MAP_PADDING],
    ],
    koreaProvinceJson as GeoJSON.FeatureCollection,
  );

  const pathGenerator = geoPath(projection);

  return (
    <>
      {(koreaProvinceJson as GeoJSON.FeatureCollection).features.map(
        (feature, index) => {
          const d = pathGenerator(feature);

          if (!d) return null;

          return (
            <path
            key={index}
            d={d}
            fill="none"
            stroke="red"
            strokeWidth={2}
            />
          );
        },
      )}
    </>
  );
}

export default ProvinceLayer;