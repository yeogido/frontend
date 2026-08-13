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
  const setOriginalPlaceKey = useAdminEventRegistrationStore(
    (state) => state.setOriginalPlaceKey
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

      // externalPlaceId는 PlaceInfo 스키마에 required 표시가 없어(실제로도
      // 지금까지 본 데이터엔 항상 있었지만) 없는 경우를 대비해야 한다. 빈
      // 문자열로 채워 넣으면 화면엔 장소가 선택된 것처럼 보이지만 실제로는
      // 식별 불가능한 장소라 그대로 제출 시 PATCH가 깨질 수 있다 — 그런
      // 경우엔 장소를 비워서 반드시 다시 선택하게 한다.
      if (detail.place.externalPlaceId) {
        setPlace({
          id: detail.place.externalPlaceId,
          title: detail.place.name,
          address: detail.place.roadAddress || detail.place.lotAddress || '',
          imageSrc: null,
          externalPlaceId: detail.place.externalPlaceId,
          categoryGroupCode: '',
          roadAddress: detail.place.roadAddress ?? '',
          lotAddress: detail.place.lotAddress ?? '',
          latitude: detail.place.latitude,
          longitude: detail.place.longitude,
        });
        const source = detail.place.source ?? 'KAKAO';
        setPlaceSource(source);
        setOriginalPlaceKey(`${source}:${detail.place.externalPlaceId}`);
      } else {
        setPlace(null);
        setPlaceSource('KAKAO');
        setOriginalPlaceKey(null);
      }

      const thumbnailUrl = detail.thumbnailImage ?? detail.thumbnailImageUrl;
      // file 없이 previewUrl만 채워서, 새로 안 골라도 화면에 기존 사진이
      // 보이게 한다(교체/삭제 버튼도 그대로 동작).
      setPhoto(thumbnailUrl ? { file: null, previewUrl: thumbnailUrl } : null);
      setExistingThumbnailKey(deriveImageKeyFromUrl(thumbnailUrl));
      setCategory(detail.category ? toEventCategoryId(detail.category) : null);
      setBasicInfo({
        placeName: detail.title,
        placeIntro: detail.description,
        // 상세 조회는 날짜를 "2026.09.11"처럼 점으로 내려주는데,
        // EventDateGroup은 "YYYY-MM-DD"(대시)로 split해서 연/월/일
        // 드롭다운을 채운다 — 그대로 넘기면 세 칸 다 비어 보인다.
        startDate: detail.startDate.replace(/\./g, '-'),
        endDate: detail.endDate.replace(/\./g, '-'),
        phone: detail.phone,
        // 홈페이지 칸 하나로 다 담을 수 없는 타입(인스타그램 등)도 있어서
        // 있는 그대로 넘긴다 — basic-info 화면이 전부 보여주고, 그대로
        // 안 건드리면 그대로 다시 제출돼 조용히 지워지지 않는다.
        officialLinks: detail.officialLinks,
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
