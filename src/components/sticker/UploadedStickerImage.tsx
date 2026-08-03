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

  // 배경이 없는 PNG를 그대로 보여준다. 흰 배경이나 테두리를 두르면 등록 후
  // 실제로 폴더에 붙는 모습과 미리보기가 달라진다.
  return (
    <span className={`block overflow-hidden ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className={`block size-full object-contain ${imageClassName}`}
        />
      ) : null}
    </span>
  );
}
