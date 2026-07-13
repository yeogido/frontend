import { useEffect, useRef, useState } from 'react';

import { select } from 'd3-selection';
import {
  zoom,
  zoomTransform,
  type ZoomBehavior,
} from 'd3-zoom';

import MapControls from './MapControls';
import MapViewport from './MapViewport';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

function Map() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mapViewportRef = useRef<SVGGElement | null>(null);

  const zoomBehaviorRef =
    useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!svgRef.current || !mapViewportRef.current) return;

    const svg = select(svgRef.current);
    const viewport = select(mapViewportRef.current);

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .on('zoom', (event) => {
        viewport.attr('transform', event.transform.toString());
        setZoomLevel(event.transform.k);
      });

    zoomBehaviorRef.current = zoomBehavior;

    svg.call(zoomBehavior);

    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  const zoomTo = (targetScale: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;

    const svg = select(svgRef.current);

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.call(
      zoomBehaviorRef.current.scaleTo,
      targetScale,
      [width / 2, height / 2],
    );
  };

  const handleZoomIn = () => {
    const current = zoomTransform(svgRef.current!).k;
    const snapped = Math.round(current * 2) / 2;
    const next = Math.min(MAX_ZOOM, snapped + ZOOM_STEP);

    zoomTo(next);
  };

  const handleZoomOut = () => {
    const current = zoomTransform(svgRef.current!).k;
    const snapped = Math.round(current * 2) / 2;
    const next = Math.max(MIN_ZOOM, snapped - ZOOM_STEP);

    zoomTo(next);
  };

  const displayZoom = Math.round(zoomLevel * 2) / 2;

  return (
    <div className="relative h-full w-full">
      <svg
        ref={svgRef}
        className="h-full w-full"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid meet"
      >
        <MapViewport ref={mapViewportRef} />
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