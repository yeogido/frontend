import { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';
import { geoMercator, geoPath } from 'd3-geo';

import { CITY_LAYER_ZOOM } from '../constants/map';
import { buildRecordPath, buildSearchPath } from '../constants/cityMeta';
import { isMetroCityCode } from '../utils/metroCityCodes';

import koreaCityJson from '../assets/korea-city.json';

import type { KoreaCityGeoJson } from '../types/map';
import type { RegionPhotoMap } from '../types/regionPhoto';

const koreaCity = koreaCityJson as KoreaCityGeoJson;

const MAP_WIDTH = 400;
const MAP_HEIGHT = 600;
const MAP_PADDING = 20;

interface CityLayerProps {
  zoomLevel: number;
  regionPhotos: RegionPhotoMap;
}

function CityLayer({ zoomLevel, regionPhotos }: CityLayerProps) {
  const navigate = useNavigate();

  const projection = useMemo(
    () =>
      geoMercator().fitExtent(
        [
          [MAP_PADDING, MAP_PADDING],
          [MAP_WIDTH - MAP_PADDING, MAP_HEIGHT - MAP_PADDING],
        ],
        koreaCity,
      ),
    [],
  );

  const pathGenerator = useMemo(
    () => geoPath(projection),
    [projection],
  );

  const isVisible = zoomLevel >= CITY_LAYER_ZOOM;

  const handleClick = (name: string) => {
    if (!name) return;

    const record = regionPhotos?.[name];

    if (record) {
      navigate(buildRecordPath(record.folderId));
      return;
    }

    navigate(buildSearchPath(name));
  };

  return (
    <>
      {koreaCity.features.map((feature, index) => {
        const properties = feature.properties as {
          code?: string;
          name?: string;
        } | null;

        if (isMetroCityCode(properties?.code)) {
          return null;
        }

        const name = properties?.name ?? '';
        const d = pathGenerator(feature);

        if (!d) return null;

        // 사진이 있는 시/군은 축소 상태에서도 PhotoLayer가 사진을 그린다.
        // 보이는데 눌리지 않으면 어색하므로 클릭만 함께 열어 준다. 사진이
        // 없는 도형까지 열면 도 단위 클릭이 사실상 막힌다.
        const isInteractive = isVisible || Boolean(regionPhotos?.[name]);

        return (
          <path
            key={index}
            d={d}
            fill="transparent"
            stroke="#FF6F41"
            strokeWidth={0.5}
            strokeOpacity={isVisible ? 1 : 0}
            pointerEvents={isInteractive ? 'all' : 'none'}
            style={{ cursor: isInteractive ? 'pointer' : 'default' }}
            onClick={isInteractive ? () => handleClick(name) : undefined}
          />
        );
      })}
    </>
  );
}

export default CityLayer;