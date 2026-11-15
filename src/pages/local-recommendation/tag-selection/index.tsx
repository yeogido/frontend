import { ResponsivePageShell } from '../../../components/layout';
import { MIN_TOUCH_TARGET } from '../../../constants/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

import BackButton from '../components/BackButton';
import {
  KeywordSelectionSection,
  RepresentativePhotoSection,
} from './components';
import type { TagSelectionResult } from './types';
import { useTagSelection } from './useTagSelection';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 48;
const TITLE_SIZE = 28;
const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_SIZE = 14;
const BUTTON_MARGIN_TOP = 32;
const BUTTON_HEIGHT = 53;
const BUTTON_TEXT_SIZE = 14;
const BUTTON_RADIUS = 12;
const SUBMIT_ERROR_MARGIN_TOP = 8;
const SUBMIT_ERROR_TEXT_SIZE = 12;

interface TagSelectionPageProps {
  onComplete?: (result: TagSelectionResult) => void;
}

function TagSelectionPage({ onComplete }: TagSelectionPageProps) {
  const scale = useGlobalScale();
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
    goBack,
  } = useTagSelection({ onComplete });

  return (
    <ResponsivePageShell
      className="bg-white"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={32}
    >
      <BackButton onClick={goBack} />
      <main className="flex-1">
        <h1
          className="leading-[1.3] font-bold"
          style={{ fontSize: TITLE_SIZE * scale }}
        >
          사진과 키워드를
          <br />
          추가해 주세요
        </h1>
        <p
          className="text-gray-5"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
          }}
        >
          코스를 더 매력적으로 소개할 수 있어요!
        </p>

        {shouldShowImageRecoveryMessage ? (
          <p className="text-main-5 mt-2 text-sm" role="alert">
            새로고침으로 사진이 사라졌습니다. 대표 사진과 장소 사진을 다시
            등록해 주세요.
          </p>
        ) : null}
        <RepresentativePhotoSection
          photo={photo}
          onPhotoChange={handlePhotoChange}
        />
        <KeywordSelectionSection
          selectedTagIds={selectedTagIds}
          limitMessage={limitMessage}
          onToggle={handleTagToggle}
        />
      </main>

      <button
        type="button"
        disabled={!isReady || isSubmitting}
        onClick={handleComplete}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full shrink-0 font-semibold"
        style={{
          marginTop: BUTTON_MARGIN_TOP * scale,
          height: BUTTON_HEIGHT * scale,
          minHeight: MIN_TOUCH_TARGET,
          fontSize: BUTTON_TEXT_SIZE * scale,
          borderRadius: BUTTON_RADIUS * scale,
        }}
      >
        {isSubmitting ? '업로드 중...' : '코스 선택하기'}
      </button>

      {submitError ? (
        <p
          className="text-main-5"
          style={{
            marginTop: SUBMIT_ERROR_MARGIN_TOP * scale,
            fontSize: SUBMIT_ERROR_TEXT_SIZE * scale,
          }}
          aria-live="polite"
        >
          {submitError}
        </p>
      ) : null}
    </ResponsivePageShell>
  );
}

export default TagSelectionPage;
