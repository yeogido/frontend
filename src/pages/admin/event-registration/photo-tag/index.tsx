import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../../components/layout/ResponsivePageShell';
import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useAdminEventRegistrationStore } from '../../../../store/adminEventRegistration.store';
import type { TagId } from '../../../../types/tag.type';

import BackButton from '../../../local-recommendation/components/BackButton';
import RepresentativePhotoSection from '../../../local-recommendation/tag-selection/components/RepresentativePhotoSection';
import KeywordSelectionSection from '../../../local-recommendation/tag-selection/components/KeywordSelectionSection';
import { toggleTag } from '../../../local-recommendation/tag-selection/utils';
import type { PhotoSelection } from '../../../local-recommendation/tag-selection/types';
import CategorySelectionSection from './components/CategorySelectionSection';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 48;
const TITLE_SIZE = 28;
const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_SIZE = 14;
const BUTTON_MARGIN_TOP = 32;
const BUTTON_HEIGHT = 53;
const BUTTON_TEXT_SIZE = 14;
const BUTTON_RADIUS = 12;

function AdminEventPhotoTagPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const storedPhoto = useAdminEventRegistrationStore((state) => state.photo);
  const setPhotoInStore = useAdminEventRegistrationStore(
    (state) => state.setPhoto
  );
  const savedKeywordTagIds = useAdminEventRegistrationStore(
    (state) => state.keywordTagIds
  );
  const setKeywordTagIds = useAdminEventRegistrationStore(
    (state) => state.setKeywordTagIds
  );
  const category = useAdminEventRegistrationStore((state) => state.category);
  const setCategory = useAdminEventRegistrationStore(
    (state) => state.setCategory
  );

  const [photo, setPhoto] = useState<PhotoSelection | null>(storedPhoto);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<TagId>>(
    () => new Set(savedKeywordTagIds)
  );
  const [limitMessage, setLimitMessage] = useState('');

  const handlePhotoChange = (file: File | null) => {
    if (!file) {
      setPhoto(null);
      return;
    }

    setPhoto({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handleTagToggle = (tagId: TagId) => {
    const result = toggleTag(selectedTagIds, tagId);
    setSelectedTagIds(result.selectedTagIds);
    setLimitMessage(
      result.limitReached ? '키워드는 최대 5개까지 선택할 수 있어요.' : ''
    );
  };

  const isReady = Boolean(photo) && selectedTagIds.size > 0 && category !== null;

  const handleSubmit = () => {
    if (!photo || !isReady) return;
    setPhotoInStore(photo);
    setKeywordTagIds(Array.from(selectedTagIds));
    navigate('/admin/event-registration/complete');
  };

  return (
    <ResponsivePageShell
      className="bg-white"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={32}
    >
      <BackButton
        onClick={() => navigate('/admin/event-registration/basic-info')}
      />
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
          행사를 더 매력적으로 소개할 수 있어요!
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
        <CategorySelectionSection
          selectedCategory={category}
          onSelect={setCategory}
        />
      </main>

      <button
        type="button"
        disabled={!isReady}
        onClick={handleSubmit}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full shrink-0 font-semibold"
        style={{
          marginTop: BUTTON_MARGIN_TOP * scale,
          height: Math.max(MIN_TOUCH_TARGET, BUTTON_HEIGHT * scale),
          fontSize: BUTTON_TEXT_SIZE * scale,
          borderRadius: BUTTON_RADIUS * scale,
        }}
      >
        장소 등록하기
      </button>
    </ResponsivePageShell>
  );
}

export default AdminEventPhotoTagPage;
