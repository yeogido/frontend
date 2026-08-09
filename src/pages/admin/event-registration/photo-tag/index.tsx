import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '../../../../apis/common';
import {
  createCultureContent,
  updateCultureContent,
} from '../../../../apis/contents.api';
import {
  createPresignedUrl,
  uploadFileToPresignedUrl,
} from '../../../../apis/files.api';
import { fetchHashtags } from '../../../../apis/hashtags';
import { ResponsivePageShell } from '../../../../components/layout/ResponsivePageShell';
import { useToast } from '../../../../components/toast';
import { tagDefinitionMap } from '../../../../constants/tags';
import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { useAdminEventRegistrationStore } from '../../../../store/adminEventRegistration.store';
import type { ContentCreateRequest } from '../../../../types/content.type';
import type { TagId } from '../../../../types/tag.type';
import { buildFestivalDetailPath } from '../../../../utils/routes';

import BackButton from '../../../local-recommendation/components/BackButton';
import RepresentativePhotoSection from '../../../local-recommendation/tag-selection/components/RepresentativePhotoSection';
import KeywordSelectionSection from '../../../local-recommendation/tag-selection/components/KeywordSelectionSection';
import { toggleTag } from '../../../local-recommendation/tag-selection/utils';
import { mapTagIdsToHashtagIds } from '../../../local-recommendation/tag-selection/hashtagMapping';
import CategorySelectionSection from './components/CategorySelectionSection';
import { toContentCategory, type EventCategoryId } from '../types';

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
const SUBMIT_ERROR_FONT_SIZE = 12;

const REGISTER_ERROR_MESSAGE = '행사 등록에 실패했습니다. 다시 시도해 주세요.';
const UPDATE_ERROR_MESSAGE = '행사 수정에 실패했습니다. 다시 시도해 주세요.';

function AdminEventPhotoTagPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const place = useAdminEventRegistrationStore((state) => state.place);
  const placeSource = useAdminEventRegistrationStore(
    (state) => state.placeSource
  );
  const basicInfo = useAdminEventRegistrationStore((state) => state.basicInfo);
  const editingContentId = useAdminEventRegistrationStore(
    (state) => state.editingContentId
  );
  // photo는 URL.createObjectURL로 만든 blob URL을 들고 있어 store가 유일한 소유자여야 한다.
  // (로컬 사본을 따로 두면 어느 쪽이 언제 revoke할지 애매해져 store가 아직 참조 중인 URL을
  // 컴포넌트가 먼저 해제해버리는 문제가 생긴다.) 그래서 변경 즉시 store에 반영한다.
  const photo = useAdminEventRegistrationStore((state) => state.photo);
  const setPhotoInStore = useAdminEventRegistrationStore(
    (state) => state.setPhoto
  );
  const existingThumbnailKey = useAdminEventRegistrationStore(
    (state) => state.existingThumbnailKey
  );
  const setExistingThumbnailKey = useAdminEventRegistrationStore(
    (state) => state.setExistingThumbnailKey
  );
  const savedKeywordTagIds = useAdminEventRegistrationStore(
    (state) => state.keywordTagIds
  );
  const setKeywordTagIdsInStore = useAdminEventRegistrationStore(
    (state) => state.setKeywordTagIds
  );
  const savedCategory = useAdminEventRegistrationStore(
    (state) => state.category
  );
  const setCategoryInStore = useAdminEventRegistrationStore(
    (state) => state.setCategory
  );

  const [selectedTagIds, setSelectedTagIds] = useState<Set<TagId>>(
    () => new Set(savedKeywordTagIds)
  );
  const [limitMessage, setLimitMessage] = useState('');
  const [category, setCategory] = useState<EventCategoryId | null>(
    savedCategory
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const updateContentMutation = useMutation({
    mutationFn: (payload: ContentCreateRequest) =>
      updateCultureContent(editingContentId as number, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cultureContents'] });
      void queryClient.invalidateQueries({ queryKey: ['contents', 'ongoing'] });
      void queryClient.invalidateQueries({
        queryKey: ['cultureContent', editingContentId],
      });
    },
  });

  useEffect(() => {
    if (!place) {
      navigate('/admin', { replace: true });
    }
  }, [place, navigate]);

  if (!place) return null;

  const handlePhotoChange = (file: File | null) => {
    // 사진을 지우면(교체 아님) 기존 key 재사용 폴백도 같이 지워서, "사진
    // 없음"이 진짜로 다시 골라야 하는 상태가 되게 한다.
    if (!file) {
      setExistingThumbnailKey(null);
    }
    setPhotoInStore(file ? { file, previewUrl: URL.createObjectURL(file) } : null);
  };

  const handleTagToggle = (tagId: TagId) => {
    const result = toggleTag(selectedTagIds, tagId);
    setSelectedTagIds(result.selectedTagIds);
    setKeywordTagIdsInStore(Array.from(result.selectedTagIds));
    setLimitMessage(
      result.limitReached ? '키워드는 최대 5개까지 선택할 수 있어요.' : ''
    );
  };

  const handleCategorySelect = (nextCategory: EventCategoryId) => {
    setCategory(nextCategory);
    setCategoryInStore(nextCategory);
  };

  const isReady =
    (Boolean(photo?.file) || Boolean(existingThumbnailKey)) &&
    selectedTagIds.size > 0 &&
    category !== null;

  const handleSubmit = async () => {
    if (!isReady || !category || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // 새로 고른 경우에만 업로드하고, 수정 중 그대로 둔 경우 상세 조회로
      // 알아낸 기존 key를 재사용한다(대표 사진 재업로드 강제 없음).
      const thumbnailImageKey = photo?.file
        ? await (async () => {
            const file = photo.file as File;
            const { uploadUrl, objectKey } = await createPresignedUrl({
              fileName: file.name,
              contentType: file.type,
            });
            await uploadFileToPresignedUrl(uploadUrl, file, file.type);
            return objectKey;
          })()
        : (existingThumbnailKey as string);

      const hashtags = await fetchHashtags();
      const hashtagIds = mapTagIdsToHashtagIds(
        Array.from(selectedTagIds),
        hashtags,
        (tagId) => tagDefinitionMap[tagId]?.label
      );

      const payload: ContentCreateRequest = {
        place: {
          externalPlaceId: place.externalPlaceId,
          source: placeSource,
          name: place.title,
          roadAddress: place.roadAddress,
          lotAddress: place.lotAddress,
          latitude: place.latitude,
          longitude: place.longitude,
        },
        title: basicInfo.placeName,
        description: basicInfo.placeIntro,
        category: toContentCategory(category),
        startDate: basicInfo.startDate,
        endDate: basicInfo.endDate,
        contactPhone: basicInfo.phone,
        officialUrl: basicInfo.homepage,
        thumbnailImageKey,
        hashtagIds,
      };

      const result = editingContentId
        ? await updateContentMutation.mutateAsync(payload)
        : await createCultureContent(payload);

      if (editingContentId) {
        showToast('행사를 수정했어요.');
      }

      // 여기서 스토어를 reset하면 place가 비워지면서 이 페이지의 가드(useEffect)가
      // /admin으로 되돌려버리는 것과 경쟁 상태가 생긴다. 다음 등록을 시작할 때
      // FAB(admin/index.tsx)가 이미 reset을 호출하므로 여기서는 이동만 한다.
      navigate(buildFestivalDetailPath(result.contentId));
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          editingContentId ? UPDATE_ERROR_MESSAGE : REGISTER_ERROR_MESSAGE
        )
      );
    } finally {
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
          onSelect={handleCategorySelect}
        />
      </main>

      <button
        type="button"
        disabled={!isReady || isSubmitting}
        onClick={handleSubmit}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full shrink-0 font-semibold"
        style={{
          marginTop: BUTTON_MARGIN_TOP * scale,
          height: Math.max(MIN_TOUCH_TARGET, BUTTON_HEIGHT * scale),
          fontSize: BUTTON_TEXT_SIZE * scale,
          borderRadius: BUTTON_RADIUS * scale,
        }}
      >
        {isSubmitting
          ? editingContentId
            ? '수정 중...'
            : '등록 중...'
          : editingContentId
            ? '행사 수정하기'
            : '행사 등록하기'}
      </button>

      {submitError ? (
        <p
          className="text-main-5"
          style={{
            marginTop: SUBMIT_ERROR_MARGIN_TOP * scale,
            fontSize: SUBMIT_ERROR_FONT_SIZE * scale,
          }}
          role="alert"
        >
          {submitError}
        </p>
      ) : null}
    </ResponsivePageShell>
  );
}

export default AdminEventPhotoTagPage;
