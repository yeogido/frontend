import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '../apis/common';
import { getCourseDetail } from '../apis/courses';
import { fetchHashtags } from '../apis/hashtags';
import { tagDefinitionMap } from '../constants/tags';
import type { CourseDetailItem } from '../apis/courses';
import { useToast } from '../components/toast';
import type { CourseBasicInfoValues } from '../pages/local-recommendation/course-basic-info/schema';
import {
  createEmptyLocalRecommendationDraft,
  useLocalRecommendationStore,
  type LocalRecommendationDraft,
  type PersistedSelectedFestival,
  type PersistedSelectedPlace,
} from '../store/localRecommendation.store';
import { mapTagIdsToHashtagIds } from '../pages/local-recommendation/tag-selection/hashtagMapping';
import { toContentTagIds } from '../utils/contentTags';
import { FORM_DURATION_TO_DURATION_TYPE } from '../pages/local-recommendation/course-basic-info/constants/options';
import {
  getTotalDaysForDuration,
  normalizeCourseDay,
  padVisitOrderToDays,
  resolveCourseTotalDays,
} from '../utils/courseDetail';
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
 * 내가 쓴 우리동네 코스 상세에서 "수정" 클릭 시 쓰는 진입 로직 —
 * hooks/useEditCourse.ts(여기도/관리자용)와 같은 패턴이지만 실제
 * local-recommendation 스토어/경로로 들어간다. 지역은 여기도와 같은
 * 이유로(라이브 CourseUpdateRequest에 regionId 필드가 없어 수정 불가)
 * region-selection을 건너뛰고 바로 코스 기본 정보부터 시작한다.
 */
export function useEditLocalCourse() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const loadCourseForEditing = useLocalRecommendationStore(
    (state) => state.loadCourseForEditing
  );

  const editLocalCourse = async (courseId: number) => {
    try {
      const detail = await getCourseDetail(courseId);

      const places: PersistedSelectedPlace[] = [];
      const festivals: PersistedSelectedFestival[] = [];
      const totalDays = resolveCourseTotalDays(detail);
      // 일차 확장 이전 코스는 day가 없어 전부 1일차로 모인다(normalizeCourseDay).
      const visitOrder: string[][] = Array.from(
        { length: totalDays },
        () => []
      );
      const pushToDay = (day: number | undefined, id: string) => {
        const dayIndex = Math.min(normalizeCourseDay(day), totalDays) - 1;
        visitOrder[dayIndex].push(id);
      };

      detail.courseItems.forEach((item: CourseDetailItem) => {
        if (item.type === 'PLACE') {
          places.push({
            id: item.externalPlaceId,
            title: item.name,
            address: item.roadAddress || item.lotAddress,
            imageKey: item.imageKey ?? null,
            imageUrl: item.imageUrl ?? null,
            externalPlaceId: item.externalPlaceId,
            categoryGroupCode: item.categoryGroupCode,
            roadAddress: item.roadAddress ?? '',
            lotAddress: item.lotAddress ?? '',
            latitude: item.latitude,
            longitude: item.longitude,
          });
          pushToDay(item.day, item.externalPlaceId);
        } else {
          const festivalId = String(item.contentId);
          festivals.push({
            id: festivalId,
            contentId: item.contentId,
            tag: '',
            title: item.name,
            address: item.roadAddress || item.lotAddress,
            imageSrc: item.imageUrl ?? null,
          });
          pushToDay(item.day, festivalId);
        }
      });

      // 알 수 없는 enum 값을 기본값(day-trip 등)으로 조용히 채우면, 사용자가
      // 이 필드를 안 건드리고 제출했을 때 PATCH가 실제 값을 잘못된 값으로
      // 덮어써 버린다 — 매핑이 안 되면 아예 수정 진입을 막는다.
      const duration = DURATION_TYPE_TO_FORM[detail.durationType];
      const transport = TRANSPORT_TYPE_TO_FORM[detail.transportType];
      const companion = COMPANION_TYPE_TO_FORM[detail.companionType];

      if (!duration || !transport || !companion) {
        showToast('알 수 없는 코스 정보가 있어 수정할 수 없어요.');
        return;
      }

      const basicInfo: CourseBasicInfoValues = {
        courseName: detail.title,
        summary: detail.description,
        duration,
        visitStartMonth: String(
          detail.startMonth
        ) as CourseBasicInfoValues['visitStartMonth'],
        visitEndMonth: String(
          detail.endMonth
        ) as CourseBasicInfoValues['visitEndMonth'],
        transport,
        companion,
      };

      // 해시태그는 PATCH에서 "전달 시 전체 교체"다. 복원하지 않으면 수정
      // 저장만으로 기존 태그가 전부 지워진다.
      const tagIds = toContentTagIds(detail.tags);
      // 해시태그 조회는 수정 진입의 전제가 아니다 — 실패해도 수정 화면에는
      // 들어갈 수 있어야 한다. 비면 PATCH에서 hashtagIds를 빼 기존 값을 둔다.
      const hashtags = await fetchHashtags().catch(() => []);
      const hashtagIds = mapTagIdsToHashtagIds(
        tagIds,
        hashtags,
        (tagId) => tagDefinitionMap[tagId]?.label
      );

      // 기간과 일수가 어긋나면 서버가 거절한다. 일차 확장 이전 코스는 모든
      // 항목이 1일차라 기간이 요구하는 일수만큼 빈 일차가 생기고, 사용자가
      // 수정 화면에서 채우게 된다.
      const draftTotalDays = getTotalDaysForDuration(
        FORM_DURATION_TO_DURATION_TYPE[duration],
        totalDays
      );

      const draft: LocalRecommendationDraft = {
        ...createEmptyLocalRecommendationDraft(),
        basicInfo,
        tagIds,
        hashtagIds,
        totalDays: draftTotalDays,
        coverImageKey: deriveImageKeyFromUrl(detail.thumbnailUrl),
        existingThumbnailUrl: detail.thumbnailUrl || null,
        festivals,
        places,
        visitOrder: padVisitOrderToDays(visitOrder, draftTotalDays),
        editingCourseId: courseId,
      };

      loadCourseForEditing(draft);
      // 수정은 기본 정보 화면부터 시작한다. 손댄 영역만 PATCH에 담긴다
      // (draft.dirtyFields).
      navigate('/local-recommendation/course-info');
    } catch (error) {
      showToast(getApiErrorMessage(error, '코스 정보를 불러오지 못했어요.'));
    }
  };

  return { editLocalCourse };
}
