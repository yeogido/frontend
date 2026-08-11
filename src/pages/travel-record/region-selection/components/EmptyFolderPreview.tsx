import { TravelFolderArtwork } from '../../components';

interface EmptyFolderPreviewProps {
  /** 폴더 아래에 붙일 지역명. 사용자가 검색창에 입력하는 대로 따라온다. */
  regionName: string;
}

/**
 * 인기 지역 그리드가 쓰던 세로 공간(제목 16 + gap 12 + 카드 2줄 127·15·127).
 * 그 자리를 그대로 이어받는다.
 */
const PREVIEW_AREA_HEIGHT = 297;
const FOLDER_ARTWORK_WIDTH = 159;
const FOLDER_ARTWORK_HEIGHT = 183;

// 폴더 아트워크는 159×183 고정이라, 공간을 다 채우도록 세로에 맞춰 확대한다.
// 가로는 159 * 1.62 ≒ 258px로 본문 폭(342px) 안에 들어온다.
const folderScale = PREVIEW_AREA_HEIGHT / FOLDER_ARTWORK_HEIGHT;

const previewLabel = '여행 폴더 미리보기';

function EmptyFolderPreview({ regionName }: EmptyFolderPreviewProps) {
  return (
    <section
      aria-label={regionName ? `${regionName} ${previewLabel}` : previewLabel}
      className="-mt-2 flex w-full shrink-0 flex-col items-center"
    >
      {/* 확대해도 레이아웃 상자는 159×183 그대로라, 실제로 보이는 크기만큼
          자리를 잡아 줘야 아래 지역명이 폴더와 겹치지 않는다. */}
      <div
        className="flex items-center justify-center"
        style={{
          height: PREVIEW_AREA_HEIGHT,
          width: FOLDER_ARTWORK_WIDTH * folderScale,
        }}
      >
        {/* 사진과 스티커는 다음 화면들에서 채우므로 빈 폴더만 보여 준다. */}
        <div style={{ transform: `scale(${folderScale})` }}>
          <TravelFolderArtwork
            photos={[]}
            title={regionName}
            decorations={[]}
          />
        </div>
      </div>

      {regionName ? (
        <h2 className="mt-3 w-full truncate text-center text-[16px] leading-none font-medium text-black">
          {regionName}
        </h2>
      ) : null}
    </section>
  );
}

export default EmptyFolderPreview;
