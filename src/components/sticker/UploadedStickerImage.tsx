import { useEffect, useState } from 'react';

import { createImageObjectUrl } from './imageObjectUrl';

interface UploadedStickerImageProps {
  imageFile: File;
  className?: string;
  imageClassName?: string;
}

export function UploadedStickerImage({
  imageFile,
  className = '',
  imageClassName = '',
}: UploadedStickerImageProps) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const imageResource = createImageObjectUrl(imageFile, URL);

    // Strict Mode cleanup revokes the previous URL before this effect creates the next one.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageUrl(imageResource.url);

    return imageResource.dispose;
  }, [imageFile]);

  return (
    <span
      className={`block overflow-hidden rounded-xl bg-white p-[3px] shadow-[0_2px_5px_rgba(0,0,0,0.2)] ${className}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className={`block size-full rounded-[9px] object-contain ${imageClassName}`}
        />
      ) : null}
    </span>
  );
}
