import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createPresignedUrl,
  uploadFileToPresignedUrl,
} from '../../../apis/files.api';
import { verifyBusiness } from '../../../apis/users.api';
import { MY_BUSINESSES_QUERY_KEY } from '../../../hooks/useMyBusinesses';
import { useRegions } from '../../../hooks/useRegions';
import { useAuthStore } from '../../../store/auth.store';
import type { BusinessVerifyResult } from '../../../types/business.type';
import type { PlaceItem } from '../../local-recommendation/place-selection/types';
import { resolveBusinessRegionId } from '../regionId';
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
  const setRole = useAuthStore((state) => state.setRole);
  const queryClient = useQueryClient();

  return useMutation<BusinessVerifyResult, unknown, BusinessVerificationSubmitValues>({
    mutationFn: async (values) => {
      const regionId = resolveBusinessRegionId(
        values.businessAddress,
        regionsData?.regions
      );

      // 임의의 ID로 보내면 백엔드가 REGION4041로 거절하므로, 해석에 실패하면
      // 업로드도 하지 않고 여기서 멈춘다.
      if (regionId === undefined) {
        throw new RegionResolveError();
      }

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
      // 명세서 요구사항: 성공 시 클라이언트가 들고 있는 Role을 즉시 갱신해
      // 홍보 글쓰기 권한을 열어준다.
      setRole(result.role);
      queryClient.invalidateQueries({ queryKey: MY_BUSINESSES_QUERY_KEY });
    },
  });
}
