import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchHashtags } from '../../../apis/hashtags';
import type { Hashtag } from '../../../apis/hashtags';
import { ResponsivePageShell } from '../../../components/layout';
import { tagDefinitionMap } from '../../../constants/tags';
import { MIN_TOUCH_TARGET } from '../../../constants/layout';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import {
  LOCAL_RECOMMENDATION_COVER_IMAGE_ID,
  useLocalRecommendationStore,
} from '../../../store/localRecommendation.store';

import BackButton from '../components/BackButton';
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
  const savedTagIds = useLocalRecommendationStore(
    (state) => state.draft.tagIds
  );
  const savedHashtagIds = useLocalRecommendationStore(
    (state) => state.draft.hashtagIds
  );
  const savedCoverImageKey = useLocalRecommendationStore(
    (state) => state.draft.coverImageKey
  );
  const savedCoverImage = useLocalRecommendationStore(
    (state) => state.pendingImages[LOCAL_RECOMMENDATION_COVER_IMAGE_ID]
  );
  const existingThumbnailUrl = useLocalRecommendationStore(
    (state) => state.draft.existingThumbnailUrl
  );
  const setPendingImage = useLocalRecommendationStore(
    (state) => state.setPendingImage
  );
  const removePendingImage = useLocalRecommendationStore(
    (state) => state.removePendingImage
  );
  const clearThumbnail = useLocalRecommendationStore(
    (state) => state.clearThumbnail
  );
  const imageRecoveryRequired = useLocalRecommendationStore(
    (state) => state.imageRecoveryRequired
  );
  const hasPendingImages = useLocalRecommendationStore(
    (state) => Object.keys(state.pendingImages).length > 0
  );
  const [photo, setPhoto] = useState<PhotoSelection | null>(() => {
    if (savedCoverImage) {
      return {
        file: savedCoverImage.originalFile,
        previewUrl: savedCoverImage.previewUrl,
      };
    }
    // 새로 고른 파일이 없으면(수정 진입 직후) 기존 대표 사진을 보여준다.
    return existingThumbnailUrl
      ? { file: null, previewUrl: existingThumbnailUrl }
      : null;
  });
  const [selectedTagIds, setSelectedTagIds] = useState<Set<TagId>>(
    () => new Set(savedTagIds as TagId[])
  );
  const [limitMessage, setLimitMessage] = useState('');
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const hashtagLoadPromiseRef = useRef<Promise<Hashtag[]> | null>(null);

  useEffect(() => {
    let isMounted = true;
    const hashtagLoadPromise = fetchHashtags().catch(() => []);
    hashtagLoadPromiseRef.current = hashtagLoadPromise;

    hashtagLoadPromise
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
    if (!file) {
      removePendingImage(LOCAL_RECOMMENDATION_COVER_IMAGE_ID);
      // 기존 대표 사진을 보여주고 있었다면 재사용 fallback도 함께 지운다 —
      // 안 그러면 지운 뒤에도 제출 시 기존 key를 그대로 다시 쓰게 된다.
      clearThumbnail();
      setPhoto(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingImage(LOCAL_RECOMMENDATION_COVER_IMAGE_ID, {
      file,
      previewUrl,
    });
    setPhoto({ file, previewUrl });
  };

  const handleTagToggle = (tagId: TagId) => {
    const result = toggleTag(selectedTagIds, tagId);
    setSelectedTagIds(result.selectedTagIds);
    setTagSelection({
      tagIds: Array.from(result.selectedTagIds),
      hashtagIds: savedHashtagIds,
      // coverImageKey는 사진 선택/삭제 핸들러에서만 바꾼다 — 여기서는
      // 기존 값을 그대로 넘겨 수정 진입 시 prefill된 값이 안 지워지게 한다.
      coverImageKey: savedCoverImageKey,
    });
    setLimitMessage(
      result.limitReached ? '키워드는 최대 5개까지 선택할 수 있어요.' : ''
    );
  };

  const isReady = isTagSelectionReady(photo, selectedTagIds);
  const shouldShowImageRecoveryMessage =
    imageRecoveryRequired && !hasPendingImages;

  const handleComplete = async () => {
    if (!photo || !isReady || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const loadedHashtags = await (hashtagLoadPromiseRef.current ??
        Promise.resolve(hashtags));
      const hashtagIds = mapTagIdsToHashtagIds(
        Array.from(selectedTagIds),
        loadedHashtags,
        (tagId) => tagDefinitionMap[tagId]?.label
      );

      setTagSelection({
        tagIds: Array.from(selectedTagIds),
        hashtagIds,
        // coverImageKey는 사진 선택/삭제 핸들러에서만 바꾼다 — 여기서는
        // 기존 값을 그대로 넘겨 수정 진입 시 prefill된 값이 안 지워지게 한다.
        coverImageKey: savedCoverImageKey,
      });

      completeTagSelection({
        photo,
        selectedTagIds,
        photoKey: '',
        hashtagIds,
        onComplete,
        navigate,
      });
    } catch {
      setSubmitError('태그 정보를 저장하지 못했습니다. 다시 시도해 주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsivePageShell
      className="bg-white"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={32}
    >
      <BackButton
        onClick={() => navigate('/local-recommendation/course-info')}
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
