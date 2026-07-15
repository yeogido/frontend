import { forwardRef } from 'react';

import CityLayer from './CityLayer';
import LabelLayer from './LabelLayer';
import ProvinceLayer from './ProvinceLayer';

interface MapViewportProps {
  zoomLevel: number;
}

const MapViewport = forwardRef<SVGGElement, MapViewportProps>(
  function MapViewport({ zoomLevel }, ref) {
    return (
      <g ref={ref} id="map-content">
        <ProvinceLayer />

        <CityLayer zoomLevel={zoomLevel} />

        <LabelLayer zoomLevel={zoomLevel} />
      </g>
    );
  },
);

export default MapViewport;