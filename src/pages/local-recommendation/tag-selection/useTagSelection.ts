import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchHashtags } from '../../../apis/hashtags';
import type { Hashtag } from '../../../apis/hashtags';
import { tagDefinitionMap } from '../../../constants/tags';
import {
  LOCAL_RECOMMENDATION_COVER_IMAGE_ID,
  useLocalRecommendationStore,
} from '../../../store/localRecommendation.store';

import { mapTagIdsToHashtagIds } from './hashtagMapping';
import { completeTagSelection } from './navigation';
import type { PhotoSelection, TagId, TagSelectionResult } from './types';
import { isTagSelectionReady, toggleTag } from './utils';

interface UseTagSelectionOptions {
  onComplete?: (result: TagSelectionResult) => void;
}

/**
 * 사진·키워드 선택 화면의 상태와 제출. 모바일과 데스크톱 뷰가 생김새만
 * 다르고 흐름은 같아서 여기 한 곳에 둔다.
 */
export function useTagSelection({ onComplete }: UseTagSelectionOptions = {}) {
  const navigate = useNavigate();
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
  const isEditingCourse = useLocalRecommendationStore(
    (state) => state.draft.editingCourseId !== null
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
  const submittingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const hashtagLoadPromise = fetchHashtags();
    hashtagLoadPromiseRef.current = hashtagLoadPromise;

    hashtagLoadPromise
      .then((result) => {
        if (isMounted) setHashtags(result);
      })
      .catch(() => {
        if (hashtagLoadPromiseRef.current === hashtagLoadPromise)
          hashtagLoadPromiseRef.current = null;
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePhotoChange = (file: File | null) => {
    if (submittingRef.current) return;
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
    if (submittingRef.current) return;
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
    if (!photo || !isReady || submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const loadedHashtags = await (hashtagLoadPromiseRef.current ??
        (hashtags.length ? Promise.resolve(hashtags) : fetchHashtags()));
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
        isEditingCourse,
        navigate,
      });
    } catch {
      setSubmitError('태그 정보를 저장하지 못했습니다. 다시 시도해 주세요.');
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return {
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
    goBack: () => navigate('/local-recommendation/course-info'),
  };
}
