import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '../apis/common';
import { getCultureContentDetail } from '../apis/contents.api';
import { useToast } from '../components/toast';
import { useAdminEventRegistrationStore } from '../store/adminEventRegistration.store';
import { toContentTagIds } from '../utils/contentTags';

/**
 * 관리자 행사 목록(홈/전체보기)에서 "수정" 클릭 시 공통으로 쓰는 진입 로직.
 * 카테고리/장소/사진은 상세 조회 응답에 없어 다시 선택해야 한다(place는
 * externalPlaceId/source/lotAddress가, category는 필드 자체가 응답에 없다)
 * — 그래서 이 세 값은 비워 두고, 나머지만 미리 채운 뒤 등록 플로우로 보낸다.
 */
export function useEditFestival() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const setPlace = useAdminEventRegistrationStore((state) => state.setPlace);
  const setBasicInfo = useAdminEventRegistrationStore(
    (state) => state.setBasicInfo
  );
  const setPhoto = useAdminEventRegistrationStore((state) => state.setPhoto);
  const setKeywordTagIds = useAdminEventRegistrationStore(
    (state) => state.setKeywordTagIds
  );
  const setCategory = useAdminEventRegistrationStore(
    (state) => state.setCategory
  );
  const setEditingContentId = useAdminEventRegistrationStore(
    (state) => state.setEditingContentId
  );

  const editFestival = async (contentId: number) => {
    try {
      const detail = await getCultureContentDetail(contentId);

      setPlace(null);
      setPhoto(null);
      setCategory(null);
      setBasicInfo({
        placeName: detail.title,
        placeIntro: detail.description,
        startDate: detail.startDate,
        endDate: detail.endDate,
        phone: detail.phone,
        homepage: detail.officialUrl,
      });
      setKeywordTagIds(toContentTagIds(detail.hashtags));
      setEditingContentId(contentId);

      navigate('/admin/event-registration/place-selection');
    } catch (error) {
      showToast(getApiErrorMessage(error, '행사 정보를 불러오지 못했어요.'));
    }
  };

  return { editFestival };
}
