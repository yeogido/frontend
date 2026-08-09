import { useState } from 'react';

/**
 * 후기 작성자의 프로필 사진.
 *
 * 주소가 비어 있거나 불러오지 못하면 회색 원으로 대신한다. 백엔드가
 * profileImageUrl에 URL이 아니라 S3 object key를 담아 보내는 경우가 있어
 * (Swagger에는 URL로 적혀 있다) 그대로 두면 깨진 아이콘과 alt 문구가 노출된다.
 *
 * 닉네임이 바로 옆에 함께 나오므로 사진 자체는 읽어 줄 필요가 없다.
 */
export interface ReviewerAvatarProps {
  src: string;
  /** 디자인 기준 지름(px). 카드마다 스케일이 달라 숫자로 받는다. */
  size: number;
  className?: string;
}

function ReviewerAvatar({ src, size, className = '' }: ReviewerAvatarProps) {
  const [hasFailed, setHasFailed] = useState(false);

  const style = { width: size, height: size };

  if (!src || hasFailed) {
    return (
      <div
        className={`bg-gray-2 shrink-0 rounded-full ${className}`}
        style={style}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      onError={() => setHasFailed(true)}
      className={`shrink-0 rounded-full object-cover ${className}`}
      style={style}
    />
  );
}

export default ReviewerAvatar;
