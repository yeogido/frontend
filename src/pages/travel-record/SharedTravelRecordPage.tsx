import { useEffect, useEffectEvent, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import {
  getSharedTravelRecord,
  respondToSharedTravelRecord,
} from '../../apis/travelRecords.api';
import { getApiErrorMessage, normalizeApiError } from '../../apis/common';
import { useToast } from '../../components/toast';
import { useAuthStore } from '../../store/auth.store';
import { TRAVEL_RECORD_MAP_QUERY_KEY } from './utils/mapAuth';
import { rememberTravelShareReturn } from './utils/travelShareLoginReturn';
import {
  isValidTravelShareToken,
  mapSharedTravelRecordPreview,
} from './mappers/travelSharedPreview';
import TravelRecordInvitationDialog from './components/TravelRecordInvitationDialog';

export default function SharedTravelRecordPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const { showToast } = useToast();
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.userId);
  const generation = useAuthStore((s) => s.authGeneration);
  const validToken = isValidTravelShareToken(token);
  const lock = useRef(false);

  useEffect(() => {
    if (!validToken) {
      showToast('존재하지 않는 폴더입니다');
      navigate('/', { replace: true });
    } else if (!authenticated) {
      try {
        rememberTravelShareReturn(
          sessionStorage,
          `/travel-record/shared/${token}`
        );
      } catch {
        /* 저장소를 사용할 수 없으면 로그인 후 홈으로 이동한다. */
      }
      navigate('/login', { replace: true });
    }
  }, [authenticated, navigate, showToast, token, validToken]);

  const query = useQuery({
    queryKey: ['sharedTravelRecord', userId, generation, token],
    queryFn: () => getSharedTravelRecord(token),
    enabled: authenticated && userId !== null && validToken,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const handleQueryError = useEffectEvent((error: unknown) => {
    showToast(
      normalizeApiError(error).status === 404
        ? '존재하지 않는 폴더입니다'
        : getApiErrorMessage(error, '공유 폴더를 불러오지 못했어요.')
    );
    navigate('/travel-record', { replace: true });
  });
  useEffect(() => {
    if (authenticated && query.isError) handleQueryError(query.error);
  }, [authenticated, query.isError, query.error]);

  const handleInvalidResponse = useEffectEvent(() => {
    showToast('공유 폴더를 불러오지 못했어요.');
    navigate('/travel-record', { replace: true });
  });
  useEffect(() => {
    if (
      authenticated &&
      query.data &&
      !query.data.detail &&
      (!query.data.canAccept || !query.data.preview)
    )
      handleInvalidResponse();
  }, [authenticated, query.data]);

  useEffect(() => {
    if (query.data?.detail)
      navigate(`/travel-record/${query.data.travelRecordId}`, {
        replace: true,
      });
  }, [navigate, query.data]);

  const mutation = useMutation({
    mutationFn: (status: 'ACCEPTED' | 'DECLINED') =>
      respondToSharedTravelRecord(token, status),
    retry: false,
    onSuccess: (result, status) => {
      const current = useAuthStore.getState();
      if (current.userId !== userId || current.authGeneration !== generation)
        return;
      if (
        result.status !== status ||
        result.travelRecordId !== query.data?.travelRecordId
      ) {
        showToast('초대 상태를 다시 확인해 주세요.');
        void query.refetch();
        return;
      }
      for (const queryKey of [
        ['travelRecords'],
        ['travelRecordYears'],
        TRAVEL_RECORD_MAP_QUERY_KEY,
        ['travelRecord', result.travelRecordId],
        ['travelRecordInvitations'],
      ])
        void client.invalidateQueries({ queryKey });
      navigate(
        status === 'ACCEPTED'
          ? `/travel-record/${result.travelRecordId}`
          : '/travel-record',
        { replace: true }
      );
    },
    onError: (error) => {
      const current = useAuthStore.getState();
      if (current.userId !== userId || current.authGeneration !== generation)
        return;
      if (normalizeApiError(error).status === 404) {
        showToast('존재하지 않는 폴더입니다');
        navigate('/travel-record', { replace: true });
      } else
        showToast(
          getApiErrorMessage(
            error,
            '초대를 처리하지 못했어요. 다시 시도해 주세요.'
          )
        );
    },
    onSettled: () => {
      lock.current = false;
    },
  });

  if (!authenticated || !validToken || !query.data || query.data.detail)
    return null;
  if (!query.data.canAccept || !query.data.preview) return null;
  const invitation = mapSharedTravelRecordPreview(query.data);
  const respond = (status: 'ACCEPTED' | 'DECLINED') => {
    if (lock.current) return;
    lock.current = true;
    mutation.mutate(status);
  };
  return (
    <TravelRecordInvitationDialog
        invitation={invitation}
        isPending={mutation.isPending}
        onAccept={() => respond('ACCEPTED')}
        onDecline={() => respond('DECLINED')}
        onClose={() => navigate('/travel-record', { replace: true })}
    />
  );
}
