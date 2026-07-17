import { forwardRef } from 'react';

import CityLayer from './CityLayer';
import LabelLayer from './LabelLayer';
import ProvinceLayer from './ProvinceLayer';

interface MapViewportProps {
  zoomLevel: number;
  renderScale: number;
}

const MapViewport = forwardRef<SVGGElement, MapViewportProps>(
  function MapViewport({ zoomLevel, renderScale }, ref) {
    return (
      <g ref={ref} id="map-content">
        <ProvinceLayer />

        <CityLayer zoomLevel={zoomLevel} />

        <LabelLayer zoomLevel={zoomLevel} renderScale={renderScale} />
      </g>
    );
  },
);

export default MapViewport;