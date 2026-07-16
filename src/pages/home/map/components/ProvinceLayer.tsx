import { useMemo } from 'react';

import { geoMercator, geoPath } from 'd3-geo';

import koreaProvinceJson from '../assets/korea-province.json';

const MAP_WIDTH = 400;
const MAP_HEIGHT = 600;
const MAP_PADDING = 20;

const koreaProvince =
  koreaProvinceJson as GeoJSON.FeatureCollection;

function ProvinceLayer() {
  const projection = useMemo(
    () =>
      geoMercator().fitExtent(
        [
          [MAP_PADDING, MAP_PADDING],
          [MAP_WIDTH - MAP_PADDING, MAP_HEIGHT - MAP_PADDING],
        ],
        koreaProvince,
      ),
    [],
  );

  const pathGenerator = useMemo(
    () => geoPath(projection),
    [projection],
  );

  const paths = useMemo(
    () =>
      koreaProvince.features.map((feature, index) => ({
        index,
        d: pathGenerator(feature),
      })),
    [pathGenerator],
  );

  return (
    <>
      {paths.map(({ index, d }) => {
        if (!d) return null;

        return (
          <path
            key={index}
            d={d}
            fill="none"
            stroke="#FF6F41"
            strokeWidth={1.3}
          />
        );
      })}
    </>
  );
}

export default ProvinceLayer;