import { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';
import { geoMercator, geoPath } from 'd3-geo';

import { koreaProvince } from '../assets/koreaProvince';
import { buildRecordPath, buildSearchPath } from '../constants/cityMeta';
import {
  CITY_LAYER_ZOOM,
  PROVINCE_STROKE_WIDTH,
  PROVINCE_STROKE_WIDTH_ZOOMED,
} from '../constants/map';

import type { RegionPhotoMap } from '../types/regionPhoto';

const MAP_WIDTH = 400;
const MAP_HEIGHT = 600;
const MAP_PADDING = 20;

interface ProvinceLayerProps {
  /** 0.5 단위로 스냅된 현재 줌. 선 굵기를 가른다. */
  zoomLevel: number;
  /** 줌과 무관하게 선 굵기를 유지하기 위해 나눌 배율 */
  renderScale: number;
  regionPhotos: RegionPhotoMap;
}

function ProvinceLayer({
  zoomLevel,
  renderScale,
  regionPhotos,
}: ProvinceLayerProps) {
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

  // 시/군 경계선이 함께 보일 때만 굵게 그려 도·광역시 경계를 구분한다.
  const baseStrokeWidth =
    zoomLevel >= CITY_LAYER_ZOOM
      ? PROVINCE_STROKE_WIDTH_ZOOMED
      : PROVINCE_STROKE_WIDTH;
  const strokeWidth = Math.max(baseStrokeWidth / renderScale, 0.12);

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