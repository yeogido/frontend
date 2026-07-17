import { useEffect, useRef, useState } from 'react';

import { select } from 'd3-selection';
import {
  zoom,
  zoomIdentity,
  zoomTransform,
  type ZoomBehavior,
} from 'd3-zoom';

import {
  BASE_ZOOM_SCALE,
  MAP_VIEWBOX_HEIGHT,
  MAP_VIEWBOX_WIDTH,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
} from '../constants/map';

import MapControls from './MapControls';
import MapViewport from './MapViewport';

function Map() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mapViewportRef = useRef<SVGGElement | null>(null);

  const zoomBehaviorRef =
    useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [zoomLevel, setZoomLevel] = useState(MIN_ZOOM);
  const [rawScale, setRawScale] = useState(MIN_ZOOM * BASE_ZOOM_SCALE);

  useEffect(() => {
    if (!svgRef.current || !mapViewportRef.current) return;

    const svg = select(svgRef.current);
    const viewport = select(mapViewportRef.current);

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([
        MIN_ZOOM * BASE_ZOOM_SCALE,
        MAX_ZOOM * BASE_ZOOM_SCALE,
      ])
      .on('zoom', (event) => {
        viewport.attr('transform', event.transform.toString());
        setZoomLevel(event.transform.k / BASE_ZOOM_SCALE);
        setRawScale(event.transform.k);
      });

    zoomBehaviorRef.current = zoomBehavior;

    svg.call(zoomBehavior);

    const centerX = MAP_VIEWBOX_WIDTH / 2;
    const centerY = MAP_VIEWBOX_HEIGHT / 2;
    const initialScale = MIN_ZOOM * BASE_ZOOM_SCALE;

    svg.call(
      zoomBehavior.transform,
      zoomIdentity
        .translate(centerX, centerY)
        .scale(initialScale)
        .translate(-centerX, -centerY),
    );

    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  const zoomTo = (targetLabelScale: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;

    select(svgRef.current).call(
      zoomBehaviorRef.current.scaleTo,
      targetLabelScale * BASE_ZOOM_SCALE,
      [MAP_VIEWBOX_WIDTH / 2, MAP_VIEWBOX_HEIGHT / 2],
    );
  };

  const handleZoomIn = () => {
    if (!svgRef.current) return;

    const currentLabelScale =
      zoomTransform(svgRef.current).k / BASE_ZOOM_SCALE;
    const snappedScale = Math.round(currentLabelScale * 2) / 2;
    const nextScale = Math.min(MAX_ZOOM, snappedScale + ZOOM_STEP);

    zoomTo(nextScale);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;

    const currentLabelScale =
      zoomTransform(svgRef.current).k / BASE_ZOOM_SCALE;
    const snappedScale = Math.round(currentLabelScale * 2) / 2;
    const nextScale = Math.max(MIN_ZOOM, snappedScale - ZOOM_STEP);

    zoomTo(nextScale);
  };

  const displayZoom = Math.round(zoomLevel * 2) / 2;

  return (
    <div className="relative h-full w-full">
      <svg
        ref={svgRef}
        className="h-full w-full"
        viewBox={`0 0 ${MAP_VIEWBOX_WIDTH} ${MAP_VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <MapViewport
          ref={mapViewportRef}
          zoomLevel={displayZoom}
          renderScale={rawScale}
        />
      </svg>

      <MapControls
        zoom={displayZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
}

export default Map;