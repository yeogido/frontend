import { apiClient, normalizeApiError } from './common';
import { deleteTravelRecordWithClient } from './travelRecordsClient.ts';

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
} from '../types/travelRecord.type';

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

/** FRIENDS 앨범 참여 초대만 생성한다. 앨범 생성이나 참여 수락은 수행하지 않는다. */
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

export async function getTravelRecordYears(): Promise<TravelRecordYearListResponse> {
  try {
    const { data } = await apiClient.get<TravelRecordYearListResponse>(
      '/travel-records/years'
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
