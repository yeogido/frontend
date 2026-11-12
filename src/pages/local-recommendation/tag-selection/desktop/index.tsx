import { DesktopPageShell } from '../../../../components/layout/desktop';

import type { TagSelectionResult } from '../types';
import { useTagSelection } from '../useTagSelection';
import KeywordSelectionDesktopSection from './KeywordSelectionDesktopSection';
import RepresentativePhotoDesktopSection from './RepresentativePhotoDesktopSection';

interface TagSelectionDesktopPageProps {
  onComplete?: (result: TagSelectionResult) => void;
}

/**
 * 사진과 키워드 추가 — 데스크톱 뷰(Figma 6360:38554).
 *
 * 시안의 제목은 "어떤 코스인가요?"로 적혀 있지만 그건 기본 정보 화면 문구다
 * (두 프레임의 제목이 서로 바뀌어 있다). 화면이 실제로 하는 일에 맞는
 * 모바일 문구를 그대로 쓴다.
 */
function TagSelectionDesktopPage({ onComplete }: TagSelectionDesktopPageProps) {
  const {
    photo,
    selectedTagIds,
    limitMessage,
    isReady,
    isSubmitting,
    submitError,
    shouldShowImageRecoveryMessage,
    handlePhotoChange,
    handleTagToggle,
    handleComplete,
  } = useTagSelection({ onComplete });

  return (
    <DesktopPageShell>
      <div className="flex flex-col gap-[60px]">
        <div className="flex flex-col gap-[24px]">
          <header className="flex flex-col gap-[6px]">
            <h1 className="text-[32px] font-semibold text-black">
              사진과 키워드를 추가해 주세요
            </h1>
            <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
              코스를 더 매력적으로 소개할 수 있어요!
            </p>
          </header>

          {shouldShowImageRecoveryMessage ? (
            <p className="text-main-5 text-[16px]" role="alert">
              새로고침으로 사진이 사라졌습니다. 대표 사진과 장소 사진을 다시
              등록해 주세요.
            </p>
          ) : null}

          <RepresentativePhotoDesktopSection
            photo={photo}
            onPhotoChange={handlePhotoChange}
          />

          <KeywordSelectionDesktopSection
            selectedTagIds={selectedTagIds}
            limitMessage={limitMessage}
            onToggle={handleTagToggle}
          />
        </div>

        <div>
          <button
            type="button"
            disabled={!isReady || isSubmitting}
            onClick={handleComplete}
            className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 w-full rounded-[12px] py-[16px] text-[24px] font-semibold text-white disabled:cursor-not-allowed"
          >
            {isSubmitting ? '업로드 중...' : '코스 선택하기'}
          </button>

          {submitError ? (
            <p className="text-main-5 mt-[8px] text-[16px]" aria-live="polite">
              {submitError}
            </p>
          ) : null}
        </div>
      </div>
    </DesktopPageShell>
  );
}

export default TagSelectionDesktopPage;
