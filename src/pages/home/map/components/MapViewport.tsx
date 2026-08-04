import { forwardRef } from 'react';

import CityLayer from './CityLayer';
import DokdoLayer from './DokdoLayer';
import LabelLayer from './LabelLayer';
import PhotoLayer from './PhotoLayer';
import ProvinceLayer from './ProvinceLayer';
import TravelRecordMarkerLayer from './TravelRecordMarkerLayer';

import type { MapMarker } from '../types/map';
import type { RegionPhotoMap } from '../types/regionPhoto';

interface MapViewportProps {
  zoomLevel: number;
  renderScale: number;
  labelRenderScale?: number;
  markers?: readonly MapMarker[];
  regionPhotos?: RegionPhotoMap;
}

const MapViewport = forwardRef<SVGGElement, MapViewportProps>(
  function MapViewport(
    {
      zoomLevel,
      renderScale,
      labelRenderScale,
      markers = [],
      regionPhotos = {},
    },
    ref,
  ) {
    return (
      <g ref={ref} id="map-content">
        {/* 클릭 영역(Province/City) 아래, 배경 위에 사진을 깐다.
            사진은 줌과 무관하게 항상 그려진다. */}
        <PhotoLayer regionPhotos={regionPhotos} />

        <ProvinceLayer
          renderScale={renderScale}
          regionPhotos={regionPhotos}
        />

        <CityLayer
          zoomLevel={zoomLevel}
          renderScale={renderScale}
          regionPhotos={regionPhotos}
        />

        {/* 독도는 geojson에 없어 실제 좌표로 따로 그린다.
            라벨과 같은 배율·줌 기준을 써서 글씨를 맞춘다. */}
        <DokdoLayer
          zoomLevel={zoomLevel}
          renderScale={labelRenderScale ?? renderScale}
        />

        <LabelLayer
          zoomLevel={zoomLevel}
          renderScale={labelRenderScale ?? renderScale}
        />

        {markers.length > 0 ? (
          <TravelRecordMarkerLayer
            markers={markers}
            renderScale={renderScale}
          />
        ) : null}
      </g>
    );
  },
);

export default MapViewport;