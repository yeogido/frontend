import { useMemo } from 'react';

import { geoMercator, geoPath } from 'd3-geo';

import koreaProvinceJson from '../assets/korea-province.json';
import koreaCityJson from '../assets/korea-city.json';
import { CITY_LAYER_ZOOM } from '../constants/map';
import { isMetroCityCode } from '../utils/metroCityCodes';

import type { KoreaCityGeoJson } from '../types/map';
import type { RegionPhotoMap } from '../types/regionPhoto';

const MAP_WIDTH = 400;
const MAP_HEIGHT = 600;
const MAP_PADDING = 20;

const koreaProvince = koreaProvinceJson as GeoJSON.FeatureCollection;
const koreaCity = koreaCityJson as KoreaCityGeoJson;

interface PhotoLayerProps {
  zoomLevel: number;
  /** 여행 기록 페이지에서 받아온, 지역명 → 대표 사진 매핑 */
  regionPhotos: RegionPhotoMap;
}

/**
 * 지역 도형 위에 사진(여행 기록 페이지에서 받아온 사진)을 clipPath로
 * 채워 넣는 레이어. ProvinceLayer / CityLayer 위에 그려져서, 사진이
 * 있는 지역만 도형 모양 그대로 사진이 채워져 보이게 한다.
 * 클릭/줌 판정 로직은 갖지 않고 순수하게 시각 표현만 담당한다.
 */
function PhotoLayer({ zoomLevel, regionPhotos }: PhotoLayerProps) {
  const isCity = zoomLevel >= CITY_LAYER_ZOOM;

  const provinceProjection = useMemo(
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

  const cityProjection = useMemo(
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

  const provincePath = useMemo(
    () => geoPath(provinceProjection),
    [provinceProjection],
  );

  const cityPath = useMemo(
    () => geoPath(cityProjection),
    [cityProjection],
  );

  const provinceItems = useMemo(
    () =>
      koreaProvince.features
        .map((feature, index) => {
          const properties = feature.properties as {
            name?: string;
          } | null;

          const name = properties?.name ?? '';
          const photoUrl = regionPhotos[name]?.photoUrl;

          if (!photoUrl) return null;

          const d = provincePath(feature);
          if (!d) return null;

          const bounds = provincePath.bounds(feature);

          return { key: `province-${index}`, d, bounds, photoUrl };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [provincePath, regionPhotos],
  );

  const cityItems = useMemo(() => {
    if (!isCity) return [];

    return koreaCity.features
      .map((feature, index) => {
        const properties = feature.properties as {
          code?: string;
          name?: string;
        } | null;

        if (isMetroCityCode(properties?.code)) return null;

        const name = properties?.name ?? '';
        const photoUrl = regionPhotos[name]?.photoUrl;

        if (!photoUrl) return null;

        const d = cityPath(feature);
        if (!d) return null;

        const bounds = cityPath.bounds(feature);

        return { key: `city-${index}`, d, bounds, photoUrl };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [isCity, cityPath, regionPhotos]);

  const items = isCity ? cityItems : provinceItems;

  return (
    <>
      {items.map(({ key, d, bounds, photoUrl }) => {
        const [[x0, y0], [x1, y1]] = bounds;
        const width = x1 - x0;
        const height = y1 - y0;
        const clipId = `photo-clip-${key}`;

        return (
          <g key={key} pointerEvents="none">
            <clipPath id={clipId}>
              <path d={d} />
            </clipPath>

            <image
              href={photoUrl}
              x={x0}
              y={y0}
              width={width}
              height={height}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
            />
          </g>
        );
      })}
    </>
  );
}

export default PhotoLayer;