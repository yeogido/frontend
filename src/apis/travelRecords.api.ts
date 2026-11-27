import { apiClient, normalizeApiError } from './common';
import {
  deleteTravelRecordWithClient,
  leaveTravelRecordWithClient,
} from './travelRecordsClient.ts';

import type {
  TravelRecordCreateRequest,
  TravelRecordCreateResponse,
  TravelRecordDetailResponse,
  TravelRecordListParams,
  TravelRecordListResponse,
  TravelRecordMapParams,
  TravelRecordMapResponse,
  TravelRecordUpdateRequest,
  TravelRecordUpdateResponse,
  TravelRecordYearListResponse,
  TravelRecordInvitationCreateResponse,
  TravelRecordVisibilityUpdateRequest,
  TravelRecordVisibilityUpdateResponse,
  TravelRecordInvitationListParams,
  TravelRecordInvitationListResponse,
  TravelRecordInvitationRespondRequest,
  TravelRecordInvitationRespondResponse,
  TravelRecordReceivedInvitation,
  TravelRecordShareLinkResponse,
  TravelRecordSharedView,
  TravelRecordShareRespondResponse,
  TravelRecordInvitationResponseStatus,
} from '../types/travelRecord.type';

export async function getSharedTravelRecord(
  token: string
): Promise<TravelRecordSharedView> {
  try {
    const { data } = await apiClient.get<TravelRecordSharedView>(
      `/travel-records/shared/${encodeURIComponent(token)}`
    );
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function respondToSharedTravelRecord(
  token: string,
  status: TravelRecordInvitationResponseStatus
): Promise<TravelRecordShareRespondResponse> {
  try {
    const { data } = await apiClient.patch<TravelRecordShareRespondResponse>(
      `/travel-records/shared/${encodeURIComponent(token)}`,
      { status }
    );
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createTravelRecordShareLink(
  travelRecordId: number
): Promise<TravelRecordShareLinkResponse> {
  try {
    const { data } = await apiClient.post<TravelRecordShareLinkResponse>(
      `/travel-records/${travelRecordId}/share-link`
    );
    if (
      data.travelRecordId !== travelRecordId ||
      !/^[a-f0-9]{64}$/.test(data.token)
    )
      throw new Error('유효하지 않은 공유 링크입니다.');
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getTravelRecordInvitation(
  invitationId: number
): Promise<TravelRecordReceivedInvitation> {
  try {
    const { data } = await apiClient.get<TravelRecordReceivedInvitation>(
      `/travel-records/invitations/${invitationId}`
    );
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function leaveTravelRecordById(
  travelRecordId: number
): Promise<void> {
  try {
    await leaveTravelRecordWithClient(apiClient, travelRecordId);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getTravelRecordInvitations(
  params: TravelRecordInvitationListParams = {}
): Promise<TravelRecordInvitationListResponse> {
  try {
    const { data } = await apiClient.get<TravelRecordInvitationListResponse>(
      '/travel-records/invitations',
      { params }
    );
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function respondToTravelRecordInvitation(
  invitationId: number,
  request: TravelRecordInvitationRespondRequest
): Promise<TravelRecordInvitationRespondResponse> {
  try {
    const { data } =
      await apiClient.patch<TravelRecordInvitationRespondResponse>(
        `/travel-records/invitations/${invitationId}`,
        request
      );
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/** 공개범위만 변경한다. 사진·스티커를 다시 저장하거나 FRIENDS 전환을 하지 않는다. */
export async function updateTravelRecordVisibility(
  travelRecordId: number,
  request: TravelRecordVisibilityUpdateRequest
): Promise<TravelRecordVisibilityUpdateResponse> {
  try {
    const { data } =
      await apiClient.patch<TravelRecordVisibilityUpdateResponse>(
        `/travel-records/${travelRecordId}/visibility`,
        request
      );
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/** 참여 초대를 생성한다. PUBLIC은 초대 성공 시 서버에서 FRIENDS로 전환된다. */
export async function inviteTravelRecordFriends(
  travelRecordId: number,
  inviteeUserIds: number[]
): Promise<TravelRecordInvitationCreateResponse> {
  try {
    const { data } = await apiClient.post<TravelRecordInvitationCreateResponse>(
      `/travel-records/${travelRecordId}/invitations`,
      { inviteeUserIds }
    );
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getTravelRecordMap(
  params: TravelRecordMapParams = {}
): Promise<TravelRecordMapResponse> {
  try {
    const { data } = await apiClient.get<TravelRecordMapResponse>(
      '/travel-records/map',
      { params }
    );
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getTravelRecords(
  params: TravelRecordListParams = {}
): Promise<TravelRecordListResponse> {
  try {
    const { data } = await apiClient.get<TravelRecordListResponse>(
      '/travel-records',
      { params }
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getTravelRecordYears(
  visibility?: TravelRecordMapParams['visibility']
): Promise<TravelRecordYearListResponse> {
  try {
    const { data } = await apiClient.get<TravelRecordYearListResponse>(
      '/travel-records/years',
      { params: visibility ? { visibility } : undefined }
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getTravelRecordDetail(
  travelRecordId: number
): Promise<TravelRecordDetailResponse> {
  try {
    const { data } = await apiClient.get<TravelRecordDetailResponse>(
      `/travel-records/${travelRecordId}`
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createTravelRecord(
  request: TravelRecordCreateRequest
): Promise<TravelRecordCreateResponse> {
  try {
    const { data } = await apiClient.post<TravelRecordCreateResponse>(
      '/travel-records',
      request
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateTravelRecord(
  travelRecordId: number,
  request: TravelRecordUpdateRequest
): Promise<TravelRecordUpdateResponse> {
  try {
    const { data } = await apiClient.patch<TravelRecordUpdateResponse>(
      `/travel-records/${travelRecordId}`,
      request
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteTravelRecordById(
  travelRecordId: number
): Promise<void> {
  try {
    await deleteTravelRecordWithClient(apiClient, travelRecordId);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
