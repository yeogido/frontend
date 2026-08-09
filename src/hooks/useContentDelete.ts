import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '../apis/common';
import { deleteCultureContent } from '../apis/contents.api';
import { useToast } from '../components/toast';
import { removeRecentCultureContent } from '../utils/recentCultureContents';

export function useContentDelete() {
  const [targetContentId, setTargetContentId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const deleteContentMutation = useMutation({
    mutationFn: deleteCultureContent,
    onSuccess: (_, contentId) => {
      void queryClient.invalidateQueries({ queryKey: ['cultureContents'] });
      void queryClient.invalidateQueries({ queryKey: ['contents', 'ongoing'] });
      queryClient.removeQueries({ queryKey: ['cultureContent', contentId] });
      removeRecentCultureContent(contentId);
    },
  });

  const closeDialog = () => setTargetContentId(null);

  const confirmDelete = async () => {
    if (targetContentId === null || deleteContentMutation.isPending) return;

    try {
      await deleteContentMutation.mutateAsync(targetContentId);
      closeDialog();
      showToast('행사를 삭제했어요.');
    } catch (error) {
      closeDialog();
      showToast(getApiErrorMessage(error, '행사를 삭제하지 못했어요.'));
    }
  };

  return {
    requestDelete: setTargetContentId,
    dialogProps: {
      isOpen: targetContentId !== null,
      isPending: deleteContentMutation.isPending,
      onCancel: closeDialog,
      onConfirm: () => void confirmDelete(),
    },
  };
}
