import { useId } from 'react';

import {
  FOLDER_ARTWORK_WIDTH,
  FOLDER_FRONT_HEIGHT,
  FOLDER_FRONT_TOP,
  folderClipPath,
  folderClipPathData,
} from './folderArtworkLayout';

/**
 * 사진 위를 덮는 폴더 앞면. 반투명 유리판과 테두리 그라디언트로 이루어진다.
 *
 * 실제 폴더 카드와 로딩 스켈레톤이 같은 판을 써야 두 모습이 어긋나지 않는다.
 */
export function FolderFrontFace() {
  const borderGradientId = `travel-folder-border-${useId().replaceAll(':', '')}`;

  return (
    <>
      <div
        className="pointer-events-none absolute z-20 overflow-hidden backdrop-blur-[22px] [-webkit-backdrop-filter:blur(22px)]"
        style={{
          top: FOLDER_FRONT_TOP,
          left: 0,
          width: FOLDER_ARTWORK_WIDTH,
          height: FOLDER_FRONT_HEIGHT,
          WebkitClipPath: folderClipPath,
          clipPath: folderClipPath,
          background:
            'radial-gradient(ellipse at 50% 35%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.11) 42%, rgba(228, 228, 228, 0.1) 100%), rgba(255, 255, 255, 0.16)',
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.32), inset 0 -10px 18px rgba(90, 90, 90, 0.08), inset 0 0 30px 14px rgba(255, 255, 255, 0.22)',
        }}
        aria-hidden="true"
      >
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_34%,rgba(70,70,70,0.16))]" />
        <span className="absolute top-0 left-0 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)]" />
      </div>

      <svg
        aria-hidden="true"
        width={FOLDER_ARTWORK_WIDTH}
        height={FOLDER_FRONT_HEIGHT}
        viewBox={`0 0 ${FOLDER_ARTWORK_WIDTH} ${FOLDER_FRONT_HEIGHT}`}
        className="pointer-events-none absolute top-[53px] left-0 z-30"
      >
        <defs>
          <linearGradient
            id={borderGradientId}
            x1="79.5"
            y1="0"
            x2="79.5"
            y2="130"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFFFF" stopOpacity="0.56" />
            <stop offset="0.46" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="1" stopColor="#898989" stopOpacity="0.28" />
          </linearGradient>
        </defs>
        <path
          d={folderClipPathData}
          fill="none"
          stroke={`url(#${borderGradientId})`}
        />
      </svg>
    </>
  );
}

export default FolderFrontFace;
