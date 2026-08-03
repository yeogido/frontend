import { type ReactNode } from 'react';

import type { TravelFolderDecoration } from '../folder-decoration/folderDecoration';

import { getDecorationLayerStyle } from './decorationRender';

interface FolderDecorationRendererProps {
  decorations?: TravelFolderDecoration[];
  renderDecoration?: (
    decorationNode: ReactNode,
    decoration: TravelFolderDecoration,
  ) => ReactNode;
}

function DecorationImage({
  decoration,
}: {
  decoration: TravelFolderDecoration;
}) {
  return (
    <span
      className="pointer-events-none absolute block size-[58px]"
      style={getDecorationLayerStyle(decoration)}
    >
      {decoration.imageUrl ? (
        <img
          src={decoration.imageUrl}
          alt=""
          loading="lazy"
          className="pointer-events-none block size-full object-contain"
        />
      ) : null}
    </span>
  );
}

export function FolderDecorationRenderer({
  decorations,
  renderDecoration,
}: FolderDecorationRendererProps) {
  return (decorations ?? []).map((decoration) => {
    const decorationNode = (
      <DecorationImage key={decoration.id} decoration={decoration} />
    );

    return renderDecoration
      ? renderDecoration(decorationNode, decoration)
      : decorationNode;
  });
}

export default FolderDecorationRenderer;
