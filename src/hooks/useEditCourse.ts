import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '../apis/common';
import { getCourseDetail } from '../apis/courses';
import type { CourseDetailItem } from '../apis/courses';
import { useToast } from '../components/toast';
import type { AdminCoursePlaceItem } from '../pages/admin/course-registration/types';
import type { FestivalItem } from '../pages/local-recommendation/event-selection/types';
import type { CourseBasicInfoValues } from '../pages/local-recommendation/course-basic-info/schema';
import type { VisitEvent } from '../pages/local-recommendation/visit-order-selection/constants';
import { useAdminCourseRegistrationStore } from '../store/adminCourseRegistration.store';
import { toContentTagIds } from '../utils/contentTags';
import { deriveImageKeyFromUrl } from '../utils/deriveImageKeyFromUrl';

const DURATION_TYPE_TO_FORM: Record<string, CourseBasicInfoValues['duration']> =
  {
    DAY_TRIP: 'day-trip',
    ONE_NIGHT: '1-night-2-days',
    TWO_NIGHT: '2-nights-3-days',
    THREE_PLUS: '3-nights-or-more',
  };

const TRANSPORT_TYPE_TO_FORM: Record<
  string,
  CourseBasicInfoValues['transport']
> = {
  WALK: 'walking',
  // 'PUBLIC'은 예전에 만들어진 코스에만 남아 있을 수 있는 값이라(생성/수정
  // 요청 스펙에서 이미 빠짐) '뚜벅이'로 합쳐서 보여준다.
  PUBLIC: 'walking',
  CAR: 'car',
};

const COMPANION_TYPE_TO_FORM: Record<
  string,
  CourseBasicInfoValues['companion']
> = {
  SOLO: 'solo',
  FRIEND: 'friends',
  COUPLE: 'couple',
  FAMILY: 'family',
  PET: 'pet',
};

/**
 * 관리자 코스 목록(홈/인기/최근)에서 "수정" 클릭 시 공통으로 쓰는 진입 로직.
 * 지역(regionId)은 상세 조회 응답에 없고 PATCH에도 필요 없어(라이브
 * CourseUpdateRequest에 필드 자체가 없다) 마법사 단계 가드만 통과하도록
 * 자리표시 지역을 넣는다 — 실제 제출 페이로드에는 쓰이지 않는다.
 * 대표 사진과 장소별 사진 모두, 새로 고르지 않으면 기존 이미지 key를
 * 재사용해 다시 올리지 않아도 되게 한다(대표 사진은 thumbnailUrl에서
 * key를 유추, 장소는 courseItems[].imageKey를 그대로 사용).
 */
export function useEditCourse() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const setRegion = useAdminCourseRegistrationStore((state) => state.setRegion);
  const setBasicInfo = useAdminCourseRegistrationStore(
    (state) => state.setBasicInfo
  );
  const setPhoto = useAdminCourseRegistrationStore((state) => state.setPhoto);
  const setKeywordTagIds = useAdminCourseRegistrationStore(
    (state) => state.setKeywordTagIds
  );
  const setSelectedPlaces = useAdminCourseRegistrationStore(
    (state) => state.setSelectedPlaces
  );
  const setSelectedEvents = useAdminCourseRegistrationStore(
    (state) => state.setSelectedEvents
  );
  const setVisitOrder = useAdminCourseRegistrationStore(
    (state) => state.setVisitOrder
  );
  const setEditingCourseId = useAdminCourseRegistrationStore(
    (state) => state.setEditingCourseId
  );
  const setExistingThumbnailKey = useAdminCourseRegistrationStore(
    (state) => state.setExistingThumbnailKey
  );

  const editCourse = async (courseId: number) => {
    try {
      const detail = await getCourseDetail(courseId);

      setRegion({ id: -1, name: detail.title, parentName: '' });
      // file 없이 previewUrl만 채워서, 새로 안 골라도 화면에 기존 사진이
      // 보이게 한다(교체/삭제 버튼도 그대로 동작).
      setPhoto(
        detail.thumbnailUrl
          ? { file: null, previewUrl: detail.thumbnailUrl }
          : null
      );
      setExistingThumbnailKey(deriveImageKeyFromUrl(detail.thumbnailUrl));
      setBasicInfo({
        courseName: detail.title,
        summary: detail.description,
        duration: DURATION_TYPE_TO_FORM[detail.durationType] ?? 'day-trip',
        visitStartMonth: String(
          detail.startMonth
        ) as CourseBasicInfoValues['visitStartMonth'],
        visitEndMonth: String(
          detail.endMonth
        ) as CourseBasicInfoValues['visitEndMonth'],
        transport: TRANSPORT_TYPE_TO_FORM[detail.transportType] ?? 'walking',
        companion: COMPANION_TYPE_TO_FORM[detail.companionType] ?? 'solo',
      });
      setKeywordTagIds(toContentTagIds(detail.tags));

      const places: AdminCoursePlaceItem[] = [];
      const events: FestivalItem[] = [];
      const visitOrder: VisitEvent[] = [];

      detail.courseItems.forEach((item: CourseDetailItem) => {
        if (item.type === 'PLACE') {
          const id = item.externalPlaceId;
          places.push({
            id,
            title: item.name,
            address: item.roadAddress || item.lotAddress,
            imageSrc: item.imageUrl,
            externalPlaceId: item.externalPlaceId,
            categoryGroupCode: '',
            roadAddress: item.roadAddress,
            lotAddress: item.lotAddress,
            latitude: item.latitude,
            longitude: item.longitude,
            photoFile: null,
            photoPreviewUrl: item.imageUrl,
            existingImageKey: item.imageKey ?? null,
          });
          visitOrder.push({
            id: `place:${id}`,
            kind: 'PLACE',
            name: item.name,
            address: item.roadAddress || item.lotAddress,
            imageSrc: item.imageUrl,
            externalPlaceId: item.externalPlaceId,
            categoryGroupCode: '',
            roadAddress: item.roadAddress,
            lotAddress: item.lotAddress,
            latitude: item.latitude,
            longitude: item.longitude,
            imageKey: item.imageKey ?? null,
          });
        } else {
          events.push({
            id: String(item.contentId),
            contentId: item.contentId,
            tag: '',
            title: item.name,
            address: item.roadAddress || item.lotAddress,
            imageSrc: item.imageUrl,
          });
          visitOrder.push({
            id: `content:${item.contentId}`,
            kind: 'CONTENT',
            name: item.name,
            address: item.roadAddress || item.lotAddress,
            imageSrc: item.imageUrl,
            contentId: item.contentId,
          });
        }
      });

      setSelectedPlaces(places);
      setSelectedEvents(events);
      setVisitOrder(visitOrder);
      setEditingCourseId(courseId);

      navigate('/admin/course-registration/basic-info');
    } catch (error) {
      showToast(getApiErrorMessage(error, '코스 정보를 불러오지 못했어요.'));
    }
  };

  return { editCourse };
}
