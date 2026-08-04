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

import type { MapMarker } from '../types/map';
import type { RegionPhotoMap } from '../types/regionPhoto';

interface MapProps {
  baseScale?: number;
  labelBaseScale?: number;
  minZoom?: number;
  initialZoom?: number;
  markers?: readonly MapMarker[];
  /** 여행 기록 페이지에서 받아온 지역별 대표 사진. 없으면 빈 객체 */
  regionPhotos?: RegionPhotoMap;
}

function Map({
  baseScale = BASE_ZOOM_SCALE,
  labelBaseScale = baseScale,
  minZoom = MIN_ZOOM,
  initialZoom = minZoom,
  markers = [],
  regionPhotos = {},
}: MapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mapViewportRef = useRef<SVGGElement | null>(null);

  const zoomBehaviorRef =
    useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [rawScale, setRawScale] = useState(initialZoom * baseScale);

  useEffect(() => {
    if (!svgRef.current || !mapViewportRef.current) return;

    const svg = select(svgRef.current);
    const viewport = select(mapViewportRef.current);

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([
        minZoom * baseScale,
        MAX_ZOOM * baseScale,
      ])
      .on('zoom', (event) => {
        viewport.attr('transform', event.transform.toString());
        setZoomLevel(event.transform.k / baseScale);
        setRawScale(event.transform.k);
      });

    zoomBehaviorRef.current = zoomBehavior;

    svg.call(zoomBehavior);

    const centerX = MAP_VIEWBOX_WIDTH / 2;
    const centerY = MAP_VIEWBOX_HEIGHT / 2;
    const initialScale = initialZoom * baseScale;

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
  }, [baseScale, initialZoom, minZoom]);

  const zoomTo = (targetLabelScale: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;

    select(svgRef.current).call(
      zoomBehaviorRef.current.scaleTo,
      targetLabelScale * baseScale,
      [MAP_VIEWBOX_WIDTH / 2, MAP_VIEWBOX_HEIGHT / 2],
    );
  };

  const handleZoomIn = () => {
    if (!svgRef.current) return;

    const currentLabelScale =
      zoomTransform(svgRef.current).k / baseScale;
    const snappedScale = Math.round(currentLabelScale * 2) / 2;
    const nextScale = Math.min(MAX_ZOOM, snappedScale + ZOOM_STEP);

    zoomTo(nextScale);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;

    const currentLabelScale =
      zoomTransform(svgRef.current).k / baseScale;
    const snappedScale = Math.round(currentLabelScale * 2) / 2;
    const nextScale = Math.max(minZoom, snappedScale - ZOOM_STEP);

    zoomTo(nextScale);
  };

  const displayZoom = Math.round(zoomLevel * 2) / 2;

  return (
    <div className="relative h-full w-full">
      {/* SVG text는 font-family를 상속받는다. 루트에서 한 번 지정해
          지역명·독도·마커 숫자가 같은 서체를 쓰게 한다. */}
      <svg
        ref={svgRef}
        className="h-full w-full font-sans"
        viewBox={`0 0 ${MAP_VIEWBOX_WIDTH} ${MAP_VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <MapViewport
          ref={mapViewportRef}
          zoomLevel={displayZoom}
          renderScale={rawScale}
          labelRenderScale={zoomLevel * labelBaseScale}
          markers={markers}
          regionPhotos={regionPhotos}
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