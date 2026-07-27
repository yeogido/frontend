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

        return (
          <path
            key={index}
            d={d}
            fill="transparent"
            stroke="#FF6F41"
            strokeWidth={0.5}
            strokeOpacity={isVisible ? 1 : 0}
            pointerEvents={isVisible ? 'all' : 'none'}
            style={{ cursor: isVisible ? 'pointer' : 'default' }}
            onClick={isVisible ? () => handleClick(name) : undefined}
          />
        );
      })}
    </>
  );
}

export default CityLayer;