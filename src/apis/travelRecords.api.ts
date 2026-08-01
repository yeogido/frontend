import {
  apiClient,
  normalizeApiError,
} from './common';
import { deleteTravelRecordWithClient } from './travelRecordsClient.ts';

import type {
  TravelRecordCreateRequest,
  TravelRecordCreateResponse,
  TravelRecordDetailResponse,
  TravelRecordListParams,
  TravelRecordListResponse,
  TravelRecordUpdateRequest,
  TravelRecordUpdateResponse,
  TravelRecordYearListResponse,
} from '../types/travelRecord.type';

export async function getTravelRecords(
  params: TravelRecordListParams = {},
): Promise<TravelRecordListResponse> {
  try {
    const { data } = await apiClient.get<TravelRecordListResponse>(
      '/travel-records',
      { params },
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getTravelRecordYears(): Promise<TravelRecordYearListResponse> {
  try {
    const { data } = await apiClient.get<TravelRecordYearListResponse>(
      '/travel-records/years',
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getTravelRecordDetail(
  travelRecordId: number,
): Promise<TravelRecordDetailResponse> {
  try {
    const { data } = await apiClient.get<TravelRecordDetailResponse>(
      `/travel-records/${travelRecordId}`,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createTravelRecord(
  request: TravelRecordCreateRequest,
): Promise<TravelRecordCreateResponse> {
  try {
    const { data } = await apiClient.post<TravelRecordCreateResponse>(
      '/travel-records',
      request,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateTravelRecord(
  travelRecordId: number,
  request: TravelRecordUpdateRequest,
): Promise<TravelRecordUpdateResponse> {
  try {
    const { data } = await apiClient.patch<TravelRecordUpdateResponse>(
      `/travel-records/${travelRecordId}`,
      request,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteTravelRecordById(
  travelRecordId: number,
): Promise<void> {
  try {
    await deleteTravelRecordWithClient(apiClient, travelRecordId);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
