import { forwardRef } from 'react';

import { CITY_LAYER_ZOOM } from '../constants/map';

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
        {zoomLevel < CITY_LAYER_ZOOM ? (
          <ProvinceLayer />
        ) : (
          <CityLayer />
        )}

        <LabelLayer zoomLevel={zoomLevel} />
      </g>
    );
  },
);

export default MapViewport;