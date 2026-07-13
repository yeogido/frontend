import { forwardRef } from 'react';

import PolygonLayer from './PolygonLayer';

const MapViewport = forwardRef<SVGGElement>(function MapViewport(_, ref) {
  return (
    <g ref={ref}>
      <PolygonLayer />
    </g>
  );
});

export default MapViewport;