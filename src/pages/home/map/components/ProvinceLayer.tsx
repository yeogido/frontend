import { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';
import { geoMercator, geoPath } from 'd3-geo';

import koreaProvinceJson from '../assets/korea-province.json';
import { buildRecordPath, buildSearchPath } from '../constants/cityMeta';
import { PROVINCE_STROKE_WIDTH } from '../constants/map';

import type { RegionPhotoMap } from '../types/regionPhoto';

const MAP_WIDTH = 400;
const MAP_HEIGHT = 600;
const MAP_PADDING = 20;

const koreaProvince =
  koreaProvinceJson as GeoJSON.FeatureCollection;

interface ProvinceLayerProps {
  /** 줌과 무관하게 선 굵기를 유지하기 위해 나눌 배율 */
  renderScale: number;
  regionPhotos: RegionPhotoMap;
}

function ProvinceLayer({ renderScale, regionPhotos }: ProvinceLayerProps) {
  const navigate = useNavigate();

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
      koreaProvince.features.map((feature, index) => {
        const properties = feature.properties as {
          name?: string;
        } | null;

        return {
          index,
          name: properties?.name ?? '',
          d: pathGenerator(feature),
        };
      }),
    [pathGenerator],
  );

  const handleClick = (name: string) => {
    if (!name) return;

    const record = regionPhotos?.[name];

    if (record) {
      navigate(buildRecordPath(record.folderId));
      return;
    }

    navigate(buildSearchPath(name));
  };

  const strokeWidth = Math.max(PROVINCE_STROKE_WIDTH / renderScale, 0.12);

  return (
    <>
      {paths.map(({ index, name, d }) => {
        if (!d) return null;

        return (
          <path
            key={index}
            d={d}
            fill="transparent"
            stroke="#FF6F41"
            strokeWidth={strokeWidth}
            style={{ cursor: 'pointer' }}
            onClick={() => handleClick(name)}
          />
        );
      })}
    </>
  );
}

export default ProvinceLayer;