import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '../apis/common';
import { publishContent } from '../apis/contents.api';
import { useToast } from '../components/toast';
import type { ContentPublishRequest } from '../types/content.type';
import { useCultureContentDetail } from './useCultureContentDetail';

/**
 * 관리자 홈의 "검토 대기 콘텐츠" 카드 클릭 → 게시 모달 흐름을 담당한다.
 * useReviewEdit(hooks/useReviews.ts)와 동일한 골격 — 대상 id만 들고 있다가
 * 모달이 스스로 상세 조회로 값을 채우고, 제출 시 여기서 mutation을 돌린다.
 */
export function useContentPublish() {
  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const detailQuery = useCultureContentDetail(editingContentId ?? 0);

  const publishMutation = useMutation({
    mutationFn: ({
      contentId,
      payload,
    }: {
      contentId: number;
      payload: ContentPublishRequest;
    }) => publishContent(contentId, payload),
    onSuccess: (_, { contentId }) => {
      void queryClient.invalidateQueries({ queryKey: ['cultureContents'] });
      void queryClient.invalidateQueries({
        queryKey: ['cultureContent', contentId],
      });
    },
  });

  const closeModal = () => setEditingContentId(null);

  const submitPublish = async (payload: ContentPublishRequest) => {
    if (editingContentId === null || publishMutation.isPending) return;

    try {
      await publishMutation.mutateAsync({
        contentId: editingContentId,
        payload,
      });
      closeModal();
      showToast('콘텐츠를 게시했어요.');
    } catch (error) {
      showToast(getApiErrorMessage(error, '콘텐츠 게시에 실패했어요.'));
    }
  };

  return {
    requestPublish: setEditingContentId,
    modalProps: {
      contentId: editingContentId,
      detail: detailQuery.data,
      isDetailPending: detailQuery.isPending,
      isSubmitting: publishMutation.isPending,
      onClose: closeModal,
      onSubmit: submitPublish,
    },
  };
}
