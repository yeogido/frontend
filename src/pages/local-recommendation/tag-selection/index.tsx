import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { uploadCourseImage } from '../../../apis/files';
import { fetchHashtags } from '../../../apis/hashtags';
import type { Hashtag } from '../../../apis/hashtags';
import { ResponsivePageShell } from '../../../components/layout';
import { tagDefinitionMap } from '../../../constants/tags';
import { MIN_TOUCH_TARGET } from '../../../constants/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLocalRecommendationStore } from '../../../store/localRecommendation.store';

import {
  KeywordSelectionSection,
  RepresentativePhotoSection,
} from './components';
import { mapTagIdsToHashtagIds } from './hashtagMapping';
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
const SUBMIT_ERROR_MARGIN_TOP = 8;
const SUBMIT_ERROR_TEXT_SIZE = 12;

interface TagSelectionPageProps {
  onComplete?: (result: TagSelectionResult) => void;
}

function TagSelectionPage({ onComplete }: TagSelectionPageProps) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const setTagSelection = useLocalRecommendationStore(
    (state) => state.setTagSelection
  );
  const [photo, setPhoto] = useState<PhotoSelection | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<TagId>>(new Set());
  const [limitMessage, setLimitMessage] = useState('');
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.previewUrl);
    },
    [photo]
  );

  useEffect(() => {
    let isMounted = true;

    fetchHashtags()
      .then((result) => {
        if (isMounted) setHashtags(result);
      })
      .catch(() => {
        // 해시태그 목록 조회에 실패해도 진행은 막지 않는다.
        // 이 경우 mapTagIdsToHashtagIds 결과가 빈 배열이 되어 hashtagIds 없이 다음 단계로 넘어간다.
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleComplete = async () => {
    if (!photo || !isReady || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const photoKey = await uploadCourseImage(photo.file);
      const hashtagIds = mapTagIdsToHashtagIds(
        Array.from(selectedTagIds),
        hashtags,
        (tagId) => tagDefinitionMap[tagId]?.label
      );

      setTagSelection({
        tagIds: Array.from(selectedTagIds),
        hashtagIds,
        coverImageKey: photoKey,
      });

      completeTagSelection({
        photo,
        selectedTagIds,
        photoKey,
        hashtagIds,
        onComplete,
        navigate,
      });
    } catch {
      setSubmitError('사진 업로드에 실패했어요. 다시 시도해 주세요.');
      setIsSubmitting(false);
    }
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
