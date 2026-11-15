import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { addPlaceLike, removePlaceLike } from '../../../../apis/courses';
import type { NormalizedApiError } from '../../../../apis/common';
import type { GeoPoint } from '../../../../components/kakaomap/types';
import { useToast } from '../../../../components/toast';
import { useContentDelete } from '../../../../hooks/useContentDelete';
import { useContentLikeToggle } from '../../../../hooks/useContentLikeToggle';
import { useCourseLikeToggle } from '../../../../hooks/useCourseLikeToggle';
import {
  useCourses,
  useNavigateToCourseDetail,
} from '../../../../hooks/useCourses';
import { useCultureContentDetail } from '../../../../hooks/useCultureContentDetail';
import { useEditFestival } from '../../../../hooks/useEditFestival';
import { useLoginModal } from '../../../../hooks/useLoginModal';
import { useIsAdmin } from '../../../../hooks/useMyProfile';
import {
  formatTodayOpeningHours,
  usePlaceOpeningHours,
} from '../../../../hooks/usePlaceOpeningHours';
import { useRemoveDeletedRecentCultureContent } from '../../../../hooks/useRecentCultureContents';
import { useAuthStore } from '../../../../store/auth.store';
import { toContentTagIds } from '../../../../utils/contentTags';
import {
  toCompanionLabel,
  toDurationLabel,
  toTransportLabel,
} from '../../../../utils/courseEnumLabels';
import { saveRecentCultureContent } from '../../../../utils/recentCultureContents';
import { buildFestivalCoursesPath } from '../../../../utils/routes';
import { mapCultureContentDetailToFestivalDetail } from '../../mappers/cultureContentDetailMapper';
import { useShareToast } from '../../hooks/useShareToast';

const RELATED_COURSE_PREVIEW_COUNT = 2;

// 상세 응답엔 목록 API의 regionName 같은 필드가 없다(코스 상세와 동일한
// 이유 — mappers/courseApiDetailMapper.ts의 deriveRegionFromCourseItems
// 참고). place.name은 장소명이라 관광공사 동기화 콘텐츠는 행사 제목과
// 같은 값이 오는 경우가 있어("최근 본 행사" 카드에 행사 제목이 위치처럼
// 뜨던 원인) 대신 도로명 주소에서 시/도+구·군을 뽑아 쓴다.
// 세종특별자치시는 구/군 없이 시 다음에 바로 도로명이 오는 주소 체계라
// 같은 방식으로 자르면 "세종특별자치시 한누리대로"처럼 도로명까지 지역명에
// 섞여 들어간다 — 그런 단일 행정구역은 시/도 토큰 하나만 쓴다.
const SINGLE_TIER_REGIONS = ['세종특별자치시'];

function deriveRegionFromAddress(address: string | undefined): string {
  if (!address) return '';

  const tokens = address.split(' ');
  if (SINGLE_TIER_REGIONS.includes(tokens[0])) return tokens[0];

  return tokens.slice(0, 2).join(' ');
}

function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  );
}

/**
 * 행사 상세 화면의 상태·데이터·동작. 모바일과 데스크톱 뷰가 같이 쓴다.
 */
export function useFestivalDetail(contentId: number) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { openLoginModal } = useLoginModal();
  const { showToast } = useToast();
  const isValidContentId = Number.isInteger(contentId) && contentId > 0;
  const { data: content, error: queryError } =
    useCultureContentDetail(contentId);
  const contentError = isValidContentId
    ? queryError
    : new Error('Invalid content ID');

  // 삭제된 행사로 들어왔다면 최근 본 목록에서도 걷어낸다.
  useRemoveDeletedRecentCultureContent(
    isValidContentId ? contentId : null,
    queryError
  );

  const { getLiked, toggleLike } = useContentLikeToggle();
  const { getLiked: getCourseLiked, toggleLike: toggleCourseLike } =
    useCourseLikeToggle();
  const { goToCourseDetail } = useNavigateToCourseDetail();
  const { editFestival } = useEditFestival();
  const isAdmin = useIsAdmin();
  const { requestDelete, dialogProps } = useContentDelete(() =>
    navigate('/festival', { replace: true })
  );
  const [placeLikedOverride, setPlaceLikedOverride] = useState<boolean | null>(
    null
  );
  // local-course 상세(CourseDetailLayout의 focusedStopId)와 같은 방식 —
  // 장소 카드를 누르면 지도를 그 자리로 되돌리고 핀을 강조한다. 핀이
  // 하나뿐이라 매번 같은 좌표를 다시 포커스하게 되는데, BaseKakaoMap의
  // panTo 이펙트는 focusedLocation "레퍼런스"가 바뀔 때만 다시 실행된다
  // — 값(위도/경도)이 아니라 객체 참조를 본다. 그래서 클릭할 때마다
  // 새 객체로 갈아끼워야, 지도를 옆으로 옮긴 뒤 같은 카드를 다시 눌러도
  // 포커스가 매번 다시 걸린다.
  const [focusedPlaceLocation, setFocusedPlaceLocation] =
    useState<GeoPoint | null>(null);
  const placeLikeRequestInFlightRef = useRef(false);
  const { copied, isToastVisible, handleShare } = useShareToast();
  const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);

  // 비로그인 상태는 좋아요를 가질 수 없으므로, 로그아웃하면 이 화면이
  // 언마운트되지 않아도 눌러뒀던 하트 표시가 바로 풀리게 한다. 렌더 중에
  // 바로 반영해야 해서(useEffect의 setState는 린트로 금지) 이전 인증
  // 상태와 비교해 바뀐 순간 초기화한다.
  if (wasAuthenticated !== isAuthenticated) {
    setWasAuthenticated(isAuthenticated);

    if (!isAuthenticated) {
      setPlaceLikedOverride(null);
    }
  }

  const festival = content
    ? mapCultureContentDetailToFestivalDetail(content)
    : null;
  const openingHoursByPlaceId = usePlaceOpeningHours(
    festival
      ? [
          {
            id: festival.place.id,
            name: festival.place.name,
            address: festival.place.address,
            latitude: festival.place.location?.latitude,
            longitude: festival.place.location?.longitude,
          },
        ]
      : []
  );
  const festivalPlaceHours = festival
    ? formatTodayOpeningHours(
        openingHoursByPlaceId.get(festival.place.id) ?? {
          currentWeekdayDescriptions: [],
          regularWeekdayDescriptions: [],
        }
      )
    : undefined;

  // "이 행사가 포함된 코스" 미리보기는 인기순 상위 2개를 그대로 보여준다.
  // GET /courses?contentId=...&sort=POPULAR가 삭제된 코스 제외·태그
  // 포함까지 다 해주므로, 여기서 따로 상세 조회나 필터링을 할 필요가 없다.
  const { data: popularRelatedCourses, isPending: isRelatedCoursesPending } =
    useCourses(
      { contentId, sort: 'POPULAR', size: RELATED_COURSE_PREVIEW_COUNT },
      { enabled: isValidContentId }
    );
  const previewCoursesWithTags = (
    popularRelatedCourses?.pages[0]?.items ?? []
  ).map((course) => ({
    id: course.courseId,
    image: course.routeImageUrl?.trim() || course.thumbnailUrl,
    title: course.title,
    duration: toDurationLabel(course.durationType),
    courseType: toTransportLabel(course.transportType),
    companion: toCompanionLabel(course.companionType),
    tags: toContentTagIds(course.tags),
    liked: course.isLiked,
  }));

  useEffect(() => {
    if (!content) return;

    saveRecentCultureContent({
      contentId: content.contentId,
      title: content.title,
      thumbnailImageUrl:
        content.thumbnailImageUrl ?? content.thumbnailImage ?? '',
      regionName: deriveRegionFromAddress(content.place.roadAddress),
      hashtags: content.hashtags,
      startDate: content.startDate,
      endDate: content.endDate,
      liked: content.liked,
    });
  }, [content]);

  const handleBack = () => {
    const cameFromAdminEventRegistrationFlow = Boolean(
      (
        location.state as {
          fromAdminEventRegistrationFlow?: boolean;
        } | null
      )?.fromAdminEventRegistrationFlow
    );

    if (cameFromAdminEventRegistrationFlow) {
      navigate('/admin', { replace: true });
      return;
    }

    // history.state.idx는 react-router의 브라우저 히스토리 항목 인덱스라,
    // 0이면 이 탭에서 처음 들어온 화면(직접 링크로 진입 등)이라 뒤로 갈
    // 곳이 없다 — 그때만 행사 목록으로 대체 이동한다.
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/festival');
    }
  };

  const handleFavoriteToggle = () => {
    if (!festival) return;

    toggleLike(contentId, getLiked(contentId, festival.liked));
  };

  const handlePlaceLikeToggle = async () => {
    if (placeLikeRequestInFlightRef.current) return;

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (!festival) return;

    const nextLiked = !(placeLikedOverride ?? festival.place.liked);
    const requestAuthGeneration = useAuthStore.getState().authGeneration;
    placeLikeRequestInFlightRef.current = true;
    setPlaceLikedOverride(nextLiked);

    try {
      if (nextLiked) {
        await addPlaceLike(festival.place.id, 'CONTENT', contentId);
      } else {
        await removePlaceLike(festival.place.id);
      }
    } catch (error) {
      // 요청이 나간 뒤 로그아웃(또는 재로그인)해서 인증 세대가 바뀌었다면,
      // 지금은 이 실패를 되돌릴 세션이 아니므로 override를 건드리지 않는다.
      if (useAuthStore.getState().authGeneration === requestAuthGeneration) {
        setPlaceLikedOverride(!nextLiked);
      }

      if (isNormalizedApiError(error) && error.code === 'AUTH4011') {
        clearAuth();
        openLoginModal();
        return;
      }

      showToast('좋아요 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      placeLikeRequestInFlightRef.current = false;
    }
  };

  const goToRelatedCourses = () =>
    navigate(buildFestivalCoursesPath(contentId));

  return {
    contentError,
    festival,
    isAdmin,
    getLiked,
    handleFavoriteToggle,
    placeLikedOverride,
    handlePlaceLikeToggle,
    focusedPlaceLocation,
    setFocusedPlaceLocation,
    festivalPlaceHours,
    previewCoursesWithTags,
    isRelatedCoursesPending,
    getCourseLiked,
    toggleCourseLike,
    goToCourseDetail,
    goToRelatedCourses,
    copied,
    isToastVisible,
    handleShare,
    handleBack,
    editFestival,
    requestDelete,
    dialogProps,
  };
}
