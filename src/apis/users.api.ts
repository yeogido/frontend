import { apiClient, normalizeApiError } from './common';

import type {
  BusinessInfoResponse,
  BusinessVerifyRequest,
  BusinessVerifyResult,
} from '../types/business.type';
import type {
  GetMyPostsParams,
  GetMyPostsResponse,
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
  UserProfileResponse,
} from '../types/user.type';

export async function getMyProfile(): Promise<UserProfileResponse> {
  try {
    const { data } = await apiClient.get<UserProfileResponse>('/users/me');

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getMyPosts(
  params: GetMyPostsParams = {},
): Promise<GetMyPostsResponse> {
  try {
    const { data } = await apiClient.get<GetMyPostsResponse>(
      '/users/me/posts',
      { params },
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateMyProfile(
  payload: UpdateMyProfileRequest,
): Promise<UpdateMyProfileResponse> {
  try {
    const { data } = await apiClient.patch<UpdateMyProfileResponse>(
      '/users/me',
      payload,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

// 백엔드가 국세청 오픈 API로 사업자 상태를 검증하고, 성공하면 유저 권한을
// BUSINESS로 승급한다. 국세청 연동 결과는 BUSINESS_VERIFY4002(정보 불일치),
// BUSINESS_VERIFY4041(폐업/미존재), BUSINESS_VERIFY5001(연동 오류)로 돌아온다.
export async function verifyBusiness(
  request: BusinessVerifyRequest,
): Promise<BusinessVerifyResult> {
  try {
    const { data } = await apiClient.post<BusinessVerifyResult>(
      '/users/business-verify',
      request,
    );

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteMyAccount(): Promise<null> {
  try {
    const { data } = await apiClient.delete<null>('/users/me');

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

// 인증 상태가 APPROVED인 사업장만, businessInfoId 최신순으로 돌아온다.
// 커서 봉투 없이 배열 그대로이며, 인증 사업장이 없으면 빈 배열이다(404 아님).
export async function getMyBusinesses(): Promise<BusinessInfoResponse[]> {
  try {
    const { data } =
      await apiClient.get<BusinessInfoResponse[]>('/users/me/businesses');

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}