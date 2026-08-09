import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '../apis/common';
import { getCultureContentDetail } from '../apis/contents.api';
import { useToast } from '../components/toast';
import { toEventCategoryId } from '../pages/admin/event-registration/types';
import { useAdminEventRegistrationStore } from '../store/adminEventRegistration.store';
import { toContentTagIds } from '../utils/contentTags';
import { deriveImageKeyFromUrl } from '../utils/deriveImageKeyFromUrl';

/**
 * 관리자 행사 목록(홈/전체보기)에서 "수정" 클릭 시 공통으로 쓰는 진입 로직.
 * place/category는 상세 조회로 미리 채워두지만, 장소는 코스의 지역과 달리
 * PATCH에 실제로 들어가는(바꿀 수 있는) 값이라 place-selection부터 그대로
 * 보여준다 — 이미 채워둔 place 덕분에 "추가된 장소"에 기존 장소가 선택된
 * 채로 뜨고, 그대로 두거나 다른 장소로 바꿀 수 있다.
 * 대표 사진만 원본 key가 없어(URL만 옴) thumbnailImage에서 유추해 재사용하고,
 * 새로 고르면 그걸 우선한다.
 */
export function useEditFestival() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const setPlace = useAdminEventRegistrationStore((state) => state.setPlace);
  const setPlaceSource = useAdminEventRegistrationStore(
    (state) => state.setPlaceSource
  );
  const setBasicInfo = useAdminEventRegistrationStore(
    (state) => state.setBasicInfo
  );
  const setPhoto = useAdminEventRegistrationStore((state) => state.setPhoto);
  const setExistingThumbnailKey = useAdminEventRegistrationStore(
    (state) => state.setExistingThumbnailKey
  );
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

      setPlace({
        id: detail.place.externalPlaceId ?? String(detail.place.placeId),
        title: detail.place.name,
        address: detail.place.roadAddress || detail.place.lotAddress || '',
        imageSrc: null,
        externalPlaceId: detail.place.externalPlaceId ?? '',
        categoryGroupCode: '',
        roadAddress: detail.place.roadAddress,
        lotAddress: detail.place.lotAddress ?? '',
        latitude: detail.place.latitude,
        longitude: detail.place.longitude,
      });
      setPlaceSource(detail.place.source ?? 'KAKAO');

      const thumbnailUrl = detail.thumbnailImage ?? detail.thumbnailImageUrl;
      // file 없이 previewUrl만 채워서, 새로 안 골라도 화면에 기존 사진이
      // 보이게 한다(교체/삭제 버튼도 그대로 동작).
      setPhoto(thumbnailUrl ? { file: null, previewUrl: thumbnailUrl } : null);
      setExistingThumbnailKey(deriveImageKeyFromUrl(thumbnailUrl));
      setCategory(detail.category ? toEventCategoryId(detail.category) : null);
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
