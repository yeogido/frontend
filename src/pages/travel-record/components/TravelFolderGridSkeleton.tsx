import { FOLDER_CARD_HEIGHT, FOLDER_GRID_ROW_GAP } from './folderArtworkLayout';
import TravelFolderCardSkeleton from './TravelFolderCardSkeleton';

/** 2열 격자에서 카드 한 줄이 차지하는 세로 길이. */
const CARD_ROW_HEIGHT = FOLDER_CARD_HEIGHT + FOLDER_GRID_ROW_GAP;
/**
 * 목록이 시작되는 위치. 위쪽 여백 12 + 탭 20 + 연도 드롭다운 48(mt-4 + h-8)
 * + 목록 여백 28이다.
 */
const GRID_TOP_OFFSET = 108;
const DESIGN_VIEWPORT_HEIGHT = 844;

// 첫 화면이 비어 보이지 않을 만큼만 채운다. 지금 값으로는 3줄 6개다.
const SKELETON_ROW_COUNT = Math.ceil(
  (DESIGN_VIEWPORT_HEIGHT - GRID_TOP_OFFSET) / CARD_ROW_HEIGHT
);
const SKELETON_CARD_COUNT = SKELETON_ROW_COUNT * 2;

const loadingLabel = '여행 폴더를 불러오는 중';

function TravelFolderGridSkeleton() {
  return (
    <section
      aria-label={loadingLabel}
      aria-busy="true"
      // 실제 목록과 같은 격자를 써야 로딩이 끝날 때 자리가 흔들리지 않는다.
      className="mt-7 grid grid-cols-2 gap-x-6 gap-y-[52px]"
    >
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
        <TravelFolderCardSkeleton key={index} />
      ))}
    </section>
  );
}

export default TravelFolderGridSkeleton;
