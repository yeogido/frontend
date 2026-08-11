import { useState } from 'react';

import { getApiErrorMessage } from '../../../../apis/common';
import {
  createPresignedUrl,
  uploadFileToPresignedUrl,
} from '../../../../apis/files.api';
import { fetchHashtags } from '../../../../apis/hashtags';
import { ResponsivePageShell } from '../../../../components/layout/ResponsivePageShell';
import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { tagDefinitionMap } from '../../../../constants/tags';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import { mapBusinessCategoryToApiParam } from '../../../local-business/mappers/businessPromotionMapper';
import { mapTagIdsToHashtagIds } from '../hashtagMapping';
import {
  type PhotoTagSelectionPhoto,
  type PhotoTagSelectionResult,
  type PromotionCategoryLabel,
  type TagId,
} from '../types';
import { toggleTag } from '../utils';

import BackButton from './BackButton';
import CategorySelectionSection from './CategorySelectionSection';
import KeywordSelectionSection from './KeywordSelectionSection';
import PhotoGallerySection, { MAX_PHOTOS } from './PhotoGallerySection';

// Figma 390 디자인 기준 리터럴 px
const PAGE_PADDING_TOP = 48;
const TITLE_SIZE = 28;
const DESCRIPTION_MARGIN_TOP = 12;
const DESCRIPTION_SIZE = 14;
const BUTTON_MARGIN_TOP = 32;
const BUTTON_HEIGHT = 53;
const BUTTON_TEXT_SIZE = 16;
const BUTTON_RADIUS = 12;
const SUBMIT_ERROR_MARGIN_TOP = 8;
const SUBMIT_ERROR_FONT_SIZE = 12;

const SUBMIT_ERROR_MESSAGE = '사진/키워드 등록에 실패했어요. 다시 시도해 주세요.';
const HASHTAG_MAPPING_ERROR_MESSAGE =
  '선택한 키워드 중 일부를 등록하지 못했어요. 다시 선택해 주세요.';

interface PhotoTagSelectionScreenProps {
  /**
   * 사진/키워드/카테고리 진행 중 값을 이 컴포넌트가 직접 들고 있지 않고
   * 상위(오케스트레이터)에서 받는다 — 뒤로가기로 이 화면이 언마운트됐다가
   * 다시 마운트돼도 입력값이 그대로 남아있게 하기 위해서다.
   */
  photos: PhotoTagSelectionPhoto[];
  onPhotosChange: (photos: PhotoTagSelectionPhoto[]) => void;
  selectedTagIds: Set<TagId>;
  onSelectedTagIdsChange: (tagIds: Set<TagId>) => void;
  category: PromotionCategoryLabel | null;
  onCategoryChange: (category: PromotionCategoryLabel | null) => void;
  onNext: (result: PhotoTagSelectionResult) => void | Promise<void>;
  onBack: () => void;
}

function PhotoTagSelectionScreen({
  photos,
  onPhotosChange,
  selectedTagIds,
  onSelectedTagIdsChange,
  category,
  onCategoryChange,
  onNext,
  onBack,
}: PhotoTagSelectionScreenProps) {
  const scale = useGlobalScale();
  const [limitMessage, setLimitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleAddPhotos = (files: File[]) => {
    const nextPhotos = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    onPhotosChange([...photos, ...nextPhotos].slice(0, MAX_PHOTOS));
  };

  const handleRemovePhoto = (id: string) => {
    const target = photos.find((photo) => photo.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onPhotosChange(photos.filter((photo) => photo.id !== id));
  };

  const handleTagToggle = (tagId: TagId) => {
    const result = toggleTag(selectedTagIds, tagId);
    onSelectedTagIdsChange(result.selectedTagIds);
    setLimitMessage(
      result.limitReached ? '키워드는 최대 5개까지 선택할 수 있어요.' : ''
    );
  };

  const isReady =
    photos.length > 0 && selectedTagIds.size > 0 && category !== null;

  const handleSubmit = async () => {
    if (!isReady || !category || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // sortOrder는 요구사항대로 "업로드 순서"를 그대로 쓴다 — 사용자가
      // 사진을 추가한 배열 순서가 곧 sortOrder(1부터)가 된다.
      const images = await Promise.all(
        photos.map(async (photo, index) => {
          const { uploadUrl, objectKey } = await createPresignedUrl({
            fileName: photo.file.name,
            contentType: photo.file.type,
          });
          await uploadFileToPresignedUrl(uploadUrl, photo.file, photo.file.type);
          return { imageKey: objectKey, sortOrder: index + 1 };
        })
      );

      const hashtags = await fetchHashtags();
      const { hashtagIds, unmappedTagIds } = mapTagIdsToHashtagIds(
        Array.from(selectedTagIds),
        hashtags,
        (tagId) => tagDefinitionMap[tagId]?.label
      );

      // 선택한 키워드 중 하나라도 서버 해시태그로 못 옮기면, 그걸 조용히
      // 빼고 등록하는 대신 여기서 막는다 — 사용자가 고른 키워드가 말없이
      // 누락된 채로 등록되는 걸 막기 위해서다.
      if (unmappedTagIds.length > 0) {
        setSubmitError(HASHTAG_MAPPING_ERROR_MESSAGE);
        return;
      }

      await onNext({
        images,
        hashtagIds,
        promotionCategory: mapBusinessCategoryToApiParam(category),
      });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, SUBMIT_ERROR_MESSAGE));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsivePageShell
      mode="standalone"
      className="bg-white"
      topPadding={PAGE_PADDING_TOP}
      bottomPadding={32}
    >
      <BackButton onClick={onBack} />
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
          장소를 더 매력적으로 소개할 수 있어요!
        </p>

        <PhotoGallerySection
          photos={photos}
          onAdd={handleAddPhotos}
          onRemove={handleRemovePhoto}
        />
        <KeywordSelectionSection
          selectedTagIds={selectedTagIds}
          limitMessage={limitMessage}
          onToggle={handleTagToggle}
        />
        <CategorySelectionSection
          selectedCategory={category}
          onSelect={onCategoryChange}
        />
      </main>

      <button
        type="button"
        disabled={!isReady || isSubmitting}
        onClick={() => void handleSubmit()}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full shrink-0 font-semibold"
        style={{
          marginTop: BUTTON_MARGIN_TOP * scale,
          height: Math.max(MIN_TOUCH_TARGET, BUTTON_HEIGHT * scale),
          fontSize: BUTTON_TEXT_SIZE * scale,
          borderRadius: BUTTON_RADIUS * scale,
        }}
      >
        {isSubmitting ? '등록 중...' : '홍보글 등록하기'}
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

export default PhotoTagSelectionScreen;
