import { useMemo } from 'react';

import { geoMercator, geoPath } from 'd3-geo';

import { koreaProvince } from '../assets/koreaProvince';
import { koreaCity } from '../assets/koreaCity';
import { isMetroCityCode } from '../utils/metroCityCodes';

import type { RegionPhotoMap } from '../types/regionPhoto';

const MAP_WIDTH = 400;
const MAP_HEIGHT = 600;
const MAP_PADDING = 20;


/**
 * 사진 위에 덮는 스크림. 사진마다 밝기가 제각각이라 그대로 두면 흰
 * 지역명이 묻힌다. 값은 디자인(Figma) 기준.
 */
const PHOTO_SCRIM_COLOR = '#000000';
const PHOTO_SCRIM_OPACITY = 0.32;

interface PhotoLayerProps {
  /** 여행 기록 페이지에서 받아온, 지역명 → 대표 사진 매핑 */
  regionPhotos: RegionPhotoMap;
}

/**
 * 지역 도형 위에 사진(여행 기록 페이지에서 받아온 사진)을 clipPath로
 * 채워 넣는 레이어. ProvinceLayer / CityLayer 위에 그려져서, 사진이
 * 있는 지역만 도형 모양 그대로 사진이 채워져 보이게 한다.
 * 클릭/줌 판정 로직은 갖지 않고 순수하게 시각 표현만 담당한다.
 *
 * 사진은 줌과 무관하게 항상 그린다. CityLayer는 축소 상태에서도 시/군
 * 도형을 그려 두고 선만 감추므로, 사진을 얹을 자리는 어느 줌에서든
 * 있다. 도 단위 사진을 먼저 깔고 시/군 사진을 그 위에 올려서, 좁은
 * 도형이 넓은 도형에 가려지지 않게 한다.
 */
function PhotoLayer({ regionPhotos }: PhotoLayerProps) {
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

          return { key: `province-${index}`, name, d, bounds, photoUrl };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [provincePath, regionPhotos],
  );

  const cityItems = useMemo(
    () =>
      koreaCity.features
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

        return { key: `city-${index}`, name, d, bounds, photoUrl };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [cityPath, regionPhotos],
  );

  const items = useMemo(() => {
    // 세종특별자치시처럼 도와 시 목록에 같은 이름이 모두 있는 지역은
    // 두 번 그려지지 않도록 더 좁은 city 도형만 남긴다.
    const cityNames = new Set(cityItems.map(({ name }) => name));

    return [
      ...provinceItems.filter(({ name }) => !cityNames.has(name)),
      ...cityItems,
    ];
  }, [cityItems, provinceItems]);

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

            {/* 도형과 같은 path라 클리핑 없이도 사진 영역에만 얹힌다 */}
            <path
              d={d}
              fill={PHOTO_SCRIM_COLOR}
              fillOpacity={PHOTO_SCRIM_OPACITY}
            />
          </g>
        );
      })}
    </>
  );
}

export default PhotoLayer;