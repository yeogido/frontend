import { forwardRef } from 'react';

import CityLayer from './CityLayer';
import LabelLayer from './LabelLayer';
import ProvinceLayer from './ProvinceLayer';
import TravelRecordMarkerLayer from './TravelRecordMarkerLayer';

import type { MapMarker } from '../types/map';

interface MapViewportProps {
  zoomLevel: number;
  renderScale: number;
  labelRenderScale?: number;
  markers?: readonly MapMarker[];
}

const MapViewport = forwardRef<SVGGElement, MapViewportProps>(
  function MapViewport(
    { zoomLevel, renderScale, labelRenderScale, markers = [] },
    ref,
  ) {
    return (
      <g ref={ref} id="map-content">
        <ProvinceLayer />

        <CityLayer zoomLevel={zoomLevel} />

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
