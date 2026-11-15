import {
  FOLDER_ARTWORK_WIDTH,
  FOLDER_FRONT_HEIGHT,
  FOLDER_FRONT_TOP,
  folderClipPath,
} from './folderArtworkLayout';

export function FolderFrontFace() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 z-20"
      style={{
        top: FOLDER_FRONT_TOP,
        width: FOLDER_ARTWORK_WIDTH,
        height: FOLDER_FRONT_HEIGHT,
        clipPath: folderClipPath,
        WebkitClipPath: folderClipPath,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        background: 'rgba(237, 237, 237, 0.16)',
      }}
    >
      {/* 사각형의 밝은 면을 안쪽에 두고 경계를 흐려 옆면·바닥으로 연결한다.
          사진은 부모의 backdrop-filter에서 한 번만 흐리고, 여기서는 반사광만 흐린다. */}
      <span
        className="absolute"
        style={{
          top: 20,
          right: 10,
          bottom: 18,
          left: 10,
          borderRadius: 10,
          background:
            'linear-gradient(to bottom, rgba(249, 249, 249, 0) 0%, rgba(249, 249, 249, 0.16) 30%, rgba(249, 249, 249, 0.24) 60%, rgba(249, 249, 249, 0.24) 100%)',
          filter: 'blur(5px)',
        }}
      />
      {/* 반사광 다음에 음영을 합성해야 밝은 중앙 면이 가장자리의 깊이를 덮지 않는다. */}
      <span
        className="absolute inset-0"
        style={{
          background: [
            'linear-gradient(to top, rgba(88, 88, 88, 0.27) 0%, rgba(95, 95, 95, 0.18) 8%, rgba(102, 102, 102, 0.07) 17%, rgba(102, 102, 102, 0) 27%)',
            'linear-gradient(to right, rgba(95, 95, 95, 0.14) 0%, rgba(95, 95, 95, 0.07) 4%, rgba(95, 95, 95, 0) 12%, rgba(95, 95, 95, 0) 88%, rgba(95, 95, 95, 0.07) 96%, rgba(95, 95, 95, 0.14) 100%)',
          ].join(', '),
        }}
      />
    </div>
  );
}

export default FolderFrontFace;
