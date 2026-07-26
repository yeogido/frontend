import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../components/layout';
import { MIN_TOUCH_TARGET } from '../../../constants/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { scaleValue } from '../../../utils/responsiveLayout';

import {
  KeywordSelectionSection,
  RepresentativePhotoSection,
} from './components';
import { completeTagSelection } from './navigation';
import type { PhotoSelection, TagId, TagSelectionResult } from './types';
import { isTagSelectionReady, toggleTag } from './utils';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 48;
const TITLE_SIZE = 28;
const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_SIZE = 14;
const BUTTON_MARGIN_TOP = 32;
const BUTTON_HEIGHT = 53;
const BUTTON_TEXT_SIZE = 14;
const BUTTON_RADIUS = 12;

interface TagSelectionPageProps {
  onComplete?: (result: TagSelectionResult) => void;
}

function TagSelectionPage({ onComplete }: TagSelectionPageProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const [photo, setPhoto] = useState<PhotoSelection | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<TagId>>(new Set());
  const [limitMessage, setLimitMessage] = useState('');

  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.previewUrl);
    },
    [photo]
  );

  const handlePhotoChange = (file: File | null) => {
    setPhoto(file ? { file, previewUrl: URL.createObjectURL(file) } : null);
  };

  const handleTagToggle = (tagId: TagId) => {
    const result = toggleTag(selectedTagIds, tagId);
    setSelectedTagIds(result.selectedTagIds);
    setLimitMessage(
      result.limitReached ? '키워드는 최대 5개까지 선택할 수 있어요.' : ''
    );
  };

  const isReady = isTagSelectionReady(photo, selectedTagIds);

  const handleComplete = () => {
    if (!photo || !isReady) return;

    completeTagSelection({
      photo,
      selectedTagIds,
      onComplete,
      navigate,
    });
  };

  return (
    <ResponsivePageShell
      className="bg-white"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={32}
    >
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
            fontSize: scaleValue(DESCRIPTION_SIZE, scale, 12),
          }}
        >
          코스를 더 매력적으로 소개할 수 있어요!
        </p>

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
        disabled={!isReady}
        onClick={handleComplete}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full shrink-0 font-semibold"
        style={{
          marginTop: BUTTON_MARGIN_TOP * scale,
          height: scaleValue(BUTTON_HEIGHT, scale, MIN_TOUCH_TARGET),
          minHeight: MIN_TOUCH_TARGET,
          fontSize: scaleValue(BUTTON_TEXT_SIZE, scale, 14),
          borderRadius: BUTTON_RADIUS * scale,
        }}
      >
        코스 선택하기
      </button>
    </ResponsivePageShell>
  );
}

export default TagSelectionPage;
