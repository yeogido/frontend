import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../../../components/layout/ResponsivePageShell';
import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useAdminCourseRegistrationStore } from '../../../../store/adminCourseRegistration.store';
import type { TagId } from '../../../../types/tag.type';

import BackButton from '../../../local-recommendation/components/BackButton';
import KeywordSelectionSection from '../../../local-recommendation/tag-selection/components/KeywordSelectionSection';
import RepresentativePhotoSection from '../../../local-recommendation/tag-selection/components/RepresentativePhotoSection';
import { toggleTag } from '../../../local-recommendation/tag-selection/utils';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 48;
const TITLE_SIZE = 28;
const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_SIZE = 14;
const BUTTON_MARGIN_TOP = 32;
const BUTTON_HEIGHT = 53;
const BUTTON_TEXT_SIZE = 14;
const BUTTON_RADIUS = 12;

function AdminCoursePhotoTagPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const region = useAdminCourseRegistrationStore((state) => state.region);
  // photo는 URL.createObjectURL로 만든 blob URL을 들고 있어 store가 유일한
  // 소유자여야 한다. 컴포넌트에 로컬 사본을 두지 않고 변경 즉시 store에 반영한다.
  const photo = useAdminCourseRegistrationStore((state) => state.photo);
  const setPhotoInStore = useAdminCourseRegistrationStore(
    (state) => state.setPhoto
  );
  const savedKeywordTagIds = useAdminCourseRegistrationStore(
    (state) => state.keywordTagIds
  );
  const setKeywordTagIdsInStore = useAdminCourseRegistrationStore(
    (state) => state.setKeywordTagIds
  );

  const [selectedTagIds, setSelectedTagIds] = useState<Set<TagId>>(
    () => new Set(savedKeywordTagIds)
  );
  const [limitMessage, setLimitMessage] = useState('');

  useEffect(() => {
    if (!region) {
      navigate('/admin/course-registration/region-selection', {
        replace: true,
      });
    }
  }, [region, navigate]);

  if (!region) return null;

  const handlePhotoChange = (file: File | null) => {
    setPhotoInStore(
      file ? { file, previewUrl: URL.createObjectURL(file) } : null
    );
  };

  const handleTagToggle = (tagId: TagId) => {
    const result = toggleTag(selectedTagIds, tagId);
    setSelectedTagIds(result.selectedTagIds);
    setKeywordTagIdsInStore(Array.from(result.selectedTagIds));
    setLimitMessage(
      result.limitReached ? '키워드는 최대 5개까지 선택할 수 있어요.' : ''
    );
  };

  const isReady = Boolean(photo) && selectedTagIds.size > 0;

  const handleSubmit = () => {
    if (!isReady) return;
    navigate('/admin/course-registration/event-selection');
  };

  return (
    <ResponsivePageShell
      className="bg-white"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={32}
    >
      <BackButton
        onClick={() => navigate('/admin/course-registration/basic-info')}
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
        onClick={handleSubmit}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full shrink-0 font-semibold"
        style={{
          marginTop: BUTTON_MARGIN_TOP * scale,
          height: Math.max(MIN_TOUCH_TARGET, BUTTON_HEIGHT * scale),
          fontSize: BUTTON_TEXT_SIZE * scale,
          borderRadius: BUTTON_RADIUS * scale,
        }}
      >
        코스 선택하기
      </button>
    </ResponsivePageShell>
  );
}

export default AdminCoursePhotoTagPage;
