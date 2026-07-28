import { useEffect, useState } from 'react';

import { createImageObjectUrl } from './imageObjectUrl';

interface UploadedStickerImageProps {
  imageFile: File;
  className?: string;
  imageClassName?: string;
}

let nextImageFileId = 1;
const imageFileIds = new WeakMap<File, number>();

const getImageFileId = (imageFile: File) => {
  const existingId = imageFileIds.get(imageFile);

  if (existingId) {
    return existingId;
  }

  const id = nextImageFileId++;
  imageFileIds.set(imageFile, id);
  return id;
};

export function UploadedStickerImage({
  imageFile,
  className = '',
  imageClassName = '',
}: UploadedStickerImageProps) {
  return (
    <UploadedStickerImageResource
      key={getImageFileId(imageFile)}
      imageFile={imageFile}
      className={className}
      imageClassName={imageClassName}
    />
  );
}

function UploadedStickerImageResource({
  imageFile,
  className,
  imageClassName,
}: Required<UploadedStickerImageProps>) {
  const [imageResource] = useState(() => createImageObjectUrl(imageFile, URL));

  useEffect(() => {
    return imageResource.dispose;
  }, [imageResource]);

  return (
    <span
      className={`block overflow-hidden rounded-xl bg-white p-[3px] shadow-[0_2px_5px_rgba(0,0,0,0.2)] ${className}`}
    >
      <img
        src={imageResource.url}
        alt=""
        className={`block size-full rounded-[9px] object-contain ${imageClassName}`}
      />
    </span>
  );
}
