import { useEffect, useMemo, type ReactNode } from 'react';

import type { TravelFolderDecoration } from '../folder-decoration/folderDecoration';
import { getStickerAsset } from '../folder-decoration/stickers';

import { getDecorationLayerStyle } from './decorationRender';

interface FolderDecorationRendererProps {
  decorations: TravelFolderDecoration[];
  renderDecoration?: (
    decorationNode: ReactNode,
    decoration: TravelFolderDecoration,
  ) => ReactNode;
}

function UploadedDecorationImage({ imageFile }: { imageFile: File }) {
  const imageUrl = useMemo(() => URL.createObjectURL(imageFile), [imageFile]);

  useEffect(() => () => URL.revokeObjectURL(imageUrl), [imageUrl]);

  return (
    <img
      src={imageUrl}
      alt=""
      className="pointer-events-none block size-full object-contain"
    />
  );
}

function DecorationImage({
  decoration,
}: {
  decoration: TravelFolderDecoration;
}) {
  const sticker = decoration.stickerId
    ? getStickerAsset(decoration.stickerId)
    : null;

  return (
    <span
      className="pointer-events-none absolute block size-[58px]"
      style={getDecorationLayerStyle(decoration)}
    >
      {decoration.source === 'upload' && decoration.imageFile ? (
        <UploadedDecorationImage imageFile={decoration.imageFile} />
      ) : sticker ? (
        <img
          src={sticker.src}
          alt=""
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
  return decorations.map((decoration) => {
    const decorationNode = (
      <DecorationImage key={decoration.id} decoration={decoration} />
    );

    return renderDecoration
      ? renderDecoration(decorationNode, decoration)
      : decorationNode;
  });
}

export default FolderDecorationRenderer;
