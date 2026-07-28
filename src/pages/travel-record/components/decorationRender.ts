import type { CSSProperties } from 'react';

interface DecorationGeometry {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export const getDecorationLayerStyle = ({
  x,
  y,
  rotation,
  scale,
  zIndex,
}: DecorationGeometry, layerOffset = 0): CSSProperties => ({
  left: `${x * 100}%`,
  top: `${y * 100}%`,
  transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
  zIndex: layerOffset + zIndex,
});
