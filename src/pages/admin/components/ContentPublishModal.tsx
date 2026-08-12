import { useState } from 'react';
import { createPortal } from 'react-dom';

import closeRounded from '../../../assets/icons/close-rounded.svg';
import { getApiErrorMessage } from '../../../apis/common';
import { fetchHashtags } from '../../../apis/hashtags';
import { tagDefinitionMap } from '../../../constants/tags';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { toContentTagIds } from '../../../utils/contentTags';
import type {
  ContentPublishRequest,
  CultureContentDetail,
} from '../../../types/content.type';
import type { TagId } from '../../../types/tag.type';

import FormField from '../../local-recommendation/course-basic-info/components/FormField';
import KeywordSelectionSection from '../../local-recommendation/tag-selection/components/KeywordSelectionSection';
import { mapTagIdsToHashtagIds } from '../../local-recommendation/tag-selection/hashtagMapping';
import { toggleTag } from '../../local-recommendation/tag-selection/utils';
import CategorySelectionSection from '../event-registration/photo-tag/components/CategorySelectionSection';
import {
  toContentCategory,
  toEventCategoryId,
  type EventCategoryId,
} from '../event-registration/types';

const INPUT_HEIGHT = 48;
const INPUT_PADDING_X = 16;
const INPUT_FONT_SIZE = 14;
const INPUT_RADIUS = 12;

export interface ContentPublishModalProps {
  /** 게시할 콘텐츠 ID. null이면 닫힌 상태다. */
  contentId: number | null;
  /** contentId의 상세 조회 결과 — 로딩 중이거나 실패하면 undefined. */
  detail: CultureContentDetail | undefined;
  isDetailPending: boolean;
  isDetailError: boolean;
  detailError: unknown;
  onRetryDetail: () => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ContentPublishRequest) => void;
}

interface ContentPublishFormProps {
  detail: CultureContentDetail;
  isSubmitting: boolean;
  onSubmit: (payload: ContentPublishRequest) => void;
}

function ContentPublishForm({
  detail,
  isSubmitting,
  onSubmit,
}: ContentPublishFormProps) {
  // 이 폼은 이미 transform: scale(...)로 통째로 확대/축소되는 모달 카드
  // 안에 있다(ContentPublishModal의 outer section) — 여기서 또 scale을
  // 곱하면 이중으로 적용된다. 그래서 리터럴 px 그대로 쓴다.
  const inputStyle = {
    height: INPUT_HEIGHT,
    paddingLeft: INPUT_PADDING_X,
    paddingRight: INPUT_PADDING_X,
    fontSize: INPUT_FONT_SIZE,
    borderRadius: INPUT_RADIUS,
  };
  const inputClassName =
    'border-gray-2 placeholder:text-gray-4 focus:border-main-5 w-full border bg-white outline-none';

  const [title, setTitle] = useState(detail.title);
  const [description, setDescription] = useState(detail.description);
  const [category, setCategory] = useState<EventCategoryId | null>(
    detail.category ? toEventCategoryId(detail.category) : null
  );
  const [selectedTagIds, setSelectedTagIds] = useState<Set<TagId>>(
    () => new Set(toContentTagIds(detail.hashtags))
  );
  const [limitMessage, setLimitMessage] = useState('');
  const [recommendPriority, setRecommendPriority] = useState(0);
  const [isMappingHashtags, setIsMappingHashtags] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleTagToggle = (tagId: TagId) => {
    const result = toggleTag(selectedTagIds, tagId);
    setSelectedTagIds(result.selectedTagIds);
    setLimitMessage(
      result.limitReached ? '키워드는 최대 5개까지 선택할 수 있어요.' : ''
    );
  };

  const canSubmit = !isSubmitting && !isMappingHashtags && title.trim() !== '';

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitError('');
    setIsMappingHashtags(true);

    try {
      // 우리동네/여기도 코스·행사 등록이 이미 쓰는 것과 동일한 매핑 —
      // 라벨 문자열로 실제 서버 해시태그 ID를 찾는다.
      const hashtags = await fetchHashtags();
      const hashtagIds = mapTagIdsToHashtagIds(
        Array.from(selectedTagIds),
        hashtags,
        (tagId) => tagDefinitionMap[tagId]?.label
      );

      onSubmit({
        title: title.trim(),
        description: description.trim(),
        category: category ? toContentCategory(category) : undefined,
        hashtagIds,
        recommendPriority,
      });
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, '해시태그 정보를 불러오지 못했어요.')
      );
    } finally {
      setIsMappingHashtags(false);
    }
  };

  return (
    <>
      <div className="mt-4">
        <FormField id="publish-title" label="제목">
          <input
            id="publish-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClassName}
            style={inputStyle}
          />
        </FormField>
      </div>

      <div className="mt-4">
        <FormField id="publish-description" label="설명">
          <label className="focus-within:border-main-5 flex h-[109px] cursor-text flex-col rounded-xl border border-[#e4e4e4] bg-white px-[14px] pt-4 pb-[10px]">
            <textarea
              id="publish-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="scrollbar-hide min-h-0 w-full flex-1 resize-none bg-transparent text-[12px] leading-4 text-[#1c1c1c] outline-none"
            />
          </label>
        </FormField>
      </div>

      <CategorySelectionSection
        selectedCategory={category}
        onSelect={setCategory}
      />
      <KeywordSelectionSection
        selectedTagIds={selectedTagIds}
        limitMessage={limitMessage}
        onToggle={handleTagToggle}
      />

      <div className="mt-4">
        <FormField id="publish-priority" label="추천 우선순위">
          <input
            id="publish-priority"
            type="number"
            min={0}
            value={recommendPriority}
            onChange={(event) =>
              setRecommendPriority(Math.max(0, Number(event.target.value) || 0))
            }
            className={inputClassName}
            style={inputStyle}
          />
        </FormField>
      </div>

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={!canSubmit}
        className={`mt-6 h-[43px] w-full rounded-xl text-[16px] font-semibold transition-colors disabled:cursor-not-allowed ${
          canSubmit ? 'bg-main-5 text-white' : 'bg-gray-2 text-gray-4'
        }`}
      >
        {isSubmitting ? '게시 중...' : '게시하기'}
      </button>

      {submitError ? (
        <p role="alert" className="text-main-5 mt-2 text-[12px]">
          {submitError}
        </p>
      ) : null}
    </>
  );
}

/**
 * 관리자 홈의 "검토 대기 콘텐츠" 카드에서 여는 관광공사 콘텐츠 검토·게시
 * 모달. ReviewEditModal(components/common)과 같은 portal+overlay 구조를
 * 쓴다. 상세 조회가 끝나기 전에는 안이 텅 빈 채로 로딩만 보여주고, 상세가
 * 오면 그 값으로만 폼 필드를 한 번 초기화한다(그 뒤로는 로딩 여부와 무관하게
 * 폼이 다시 초기화되지 않도록 별도 컴포넌트로 분리했다).
 */
function ContentPublishModal({
  contentId,
  detail,
  isDetailError,
  detailError,
  onRetryDetail,
  isSubmitting,
  onClose,
  onSubmit,
}: ContentPublishModalProps) {
  const scale = Math.min(useGlobalScale(), 1);

  if (contentId === null || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="관광공사 콘텐츠 게시"
        className="relative max-h-[calc(100dvh-48px)] w-full max-w-[342px] [scrollbar-width:none] overflow-y-auto rounded-xl bg-[#f9f9f9] px-6 pt-11 pb-5 shadow-[0_1px_5px_rgba(0,0,0,0.07)] [&::-webkit-scrollbar]:hidden"
        style={{ transform: `scale(${scale})` }}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-5 right-5 flex size-6 items-center justify-center"
        >
          <img
            src={closeRounded}
            alt=""
            aria-hidden="true"
            className="size-6"
          />
        </button>
        <h2 className="pr-8 text-[18px] leading-[21px] font-semibold text-[#1c1c1c]">
          관광공사 콘텐츠를 게시해요
        </h2>
        <p className="mt-1 text-[14px] leading-[17px] text-[#7f7f7f]">
          내용을 확인하고 필요한 정보를 보완한 뒤 게시하세요
        </p>

        {detail ? (
          // 재조회가 실패해도(isDetailError) 이전에 받아둔 detail이 남아
          // 있으면 그걸로 계속 폼을 보여준다 — 값을 고치던 중에 화면이
          // 갑자기 빈 에러 상태로 바뀌지 않게 한다.
          <ContentPublishForm
            key={contentId}
            detail={detail}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        ) : isDetailError ? (
          <div className="mt-8 flex flex-col items-center gap-3 pb-8">
            <p className="text-main-5 text-center text-[13px]">
              {getApiErrorMessage(
                detailError,
                '콘텐츠 정보를 불러오지 못했어요.'
              )}
            </p>
            <button
              type="button"
              onClick={onRetryDetail}
              className="rounded-full border border-[#e4e4e4] px-4 py-2 text-[14px] font-medium text-[#505050]"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <p className="mt-8 pb-8 text-center text-[13px] text-[#7f7f7f]">
            콘텐츠 정보를 불러오는 중이에요...
          </p>
        )}
      </section>
    </div>,
    document.body
  );
}

export default ContentPublishModal;
