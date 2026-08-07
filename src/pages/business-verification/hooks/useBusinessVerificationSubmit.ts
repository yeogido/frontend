import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createPresignedUrl,
  uploadFileToPresignedUrl,
} from '../../../apis/files.api';
import { getSubRegions } from '../../../apis/regions.api';
import { verifyBusiness } from '../../../apis/users.api';
import { MY_BUSINESSES_QUERY_PREFIX } from '../../../hooks/useMyBusinesses';
import {
  MY_PROFILE_QUERY_PREFIX,
  getMyProfileQueryKey,
} from '../../../hooks/useMyProfile';
import { useRegions } from '../../../hooks/useRegions';
import { useAuthStore } from '../../../store/auth.store';
import type { BusinessVerifyResult } from '../../../types/business.type';
import type { UserProfileResponse } from '../../../types/user.type';
import type { PlaceItem } from '../../local-recommendation/place-selection/types';
import { resolveProvinceRegionId, resolveSubRegionId } from '../regionId';
import { toBusinessNumber } from '../validation';

export const REGION_RESOLVE_ERROR_MESSAGE =
  '사업장 지역을 확인하지 못했어요. 장소를 다시 선택해 주세요.';

// 평범한 Error로 던지면 normalizeApiError가 UNKNOWN_ERROR로 분류해 문구가
// fallback으로 대체된다. code를 달아 서버 에러와 같은 경로로 흐르게 한다.
class RegionResolveError extends Error {
  readonly code = 'REGION_UNRESOLVED';

  constructor() {
    super(REGION_RESOLVE_ERROR_MESSAGE);
    this.name = 'RegionResolveError';
  }
}

interface BusinessVerificationSubmitValues {
  readonly certificate: File;
  readonly place: PlaceItem;
  readonly businessAddress: string;
  readonly businessName: string;
  readonly representativeName: string;
  readonly registrationNumber: string;
  readonly openedAt: string;
}

export function useBusinessVerificationSubmit() {
  const { data: regionsData } = useRegions();
  const userId = useAuthStore((state) => state.userId);
  const queryClient = useQueryClient();

  return useMutation<BusinessVerifyResult, unknown, BusinessVerificationSubmitValues>({
    mutationFn: async (values) => {
      const provinceRegionId = resolveProvinceRegionId(
        values.businessAddress,
        regionsData?.regions
      );

      // 임의의 ID로 보내면 백엔드가 REGION4041로 거절하므로, 해석에 실패하면
      // 업로드도 하지 않고 여기서 멈춘다.
      if (provinceRegionId === undefined) {
        throw new RegionResolveError();
      }

      // 운영 데이터가 시·군·구 단위를 쓰므로 한 단계 더 좁힌다.
      const subRegions = await getSubRegions(provinceRegionId);
      const subRegionId = resolveSubRegionId(values.businessAddress, subRegions);

      // 하위 지역 목록이 있는데 못 찾았다면 주소 형태가 예상과 다른 것이다.
      // 그대로 광역으로 보내면 사업장이 엉뚱한 지역에 조용히 묶이므로 멈춘다.
      // 광역 폴백은 세종처럼 하위 지역이 아예 없는 곳에만 허용한다.
      if (subRegionId === undefined && subRegions.length > 0) {
        throw new RegionResolveError();
      }

      const regionId = subRegionId ?? provinceRegionId;

      // presigned 서명에 content-type이 포함돼 있어, 발급 요청과 실제 업로드의
      // content-type이 다르면 S3가 서명 불일치로 거부한다. 값을 한 번만 읽어
      // 양쪽에 같은 것을 넘긴다.
      const contentType = values.certificate.type || 'image/jpeg';
      const { uploadUrl, objectKey } = await createPresignedUrl({
        fileName: values.certificate.name,
        contentType,
      });
      await uploadFileToPresignedUrl(uploadUrl, values.certificate, contentType);

      return verifyBusiness({
        businessNumber: toBusinessNumber(values.registrationNumber),
        openingDate: values.openedAt,
        representativeName: values.representativeName.trim(),
        registrationImageKey: objectKey,
        businessName: values.businessName.trim(),
        businessAddress: values.businessAddress,
        place: {
          externalPlaceId: values.place.externalPlaceId,
          source: 'KAKAO',
          name: values.place.title,
          categoryGroupCode: values.place.categoryGroupCode,
          roadAddress: values.place.roadAddress,
          lotAddress: values.place.lotAddress,
          latitude: values.place.latitude,
          longitude: values.place.longitude,
          regionId,
        },
      });
    },
    onSuccess: (result) => {
      // 명세서 요구사항: 성공 시 들고 있는 Role을 즉시 갱신해 홍보 글쓰기
      // 권한을 열어준다. 캐시에 응답의 role을 먼저 반영해 재조회를 기다리지
      // 않게 하고, 이어서 무효화해 서버 값으로 확정한다.
      queryClient.setQueryData<UserProfileResponse>(
        getMyProfileQueryKey(userId),
        (profile) => (profile ? { ...profile, role: result.role } : profile)
      );
      // 무효화는 prefix로 건다. 계정별 key라도 현재 계정 것만 살아 있다.
      queryClient.invalidateQueries({ queryKey: MY_PROFILE_QUERY_PREFIX });
      queryClient.invalidateQueries({ queryKey: MY_BUSINESSES_QUERY_PREFIX });
    },
  });
}
