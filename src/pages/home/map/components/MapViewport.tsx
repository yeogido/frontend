import { forwardRef } from 'react';

import CityLayer from './CityLayer';
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
        {/* 클릭 영역(Province/City) 위, 라벨 아래에 사진을 얹는다 */}
        <PhotoLayer zoomLevel={zoomLevel} regionPhotos={regionPhotos} />

        <ProvinceLayer regionPhotos={regionPhotos} />

        <CityLayer zoomLevel={zoomLevel} regionPhotos={regionPhotos} />

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