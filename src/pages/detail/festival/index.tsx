import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { addPlaceLike, removePlaceLike } from '../../../apis/courses';
import type { NormalizedApiError } from '../../../apis/common';
import {
  FestivalDeleteDialog,
  ReviewActionMenu,
} from '../../../components/common';
import CourseCard from '../../../components/common/CourseCard';
import CourseCardSkeleton from '../../../components/common/CourseCardSkeleton';
import SectionHeader from '../../../components/common/SectionHeader';
import BackButton from '../../local-recommendation/components/BackButton';
import BaseKakaoMap from '../../../components/kakaomap/BaseKakaoMap';
import { isValidGeoPoint, type GeoPoint } from '../../../components/kakaomap/types';
import { openKakaoMapRoute } from '../../../components/kakaomap/utils/kakaoMapLink';
import {
  ResponsiveFullBleed,
  ResponsivePageShell,
} from '../../../components/layout/ResponsivePageShell';
import { useToast } from '../../../components/toast';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useContentDelete } from '../../../hooks/useContentDelete';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import {
  useCourses,
  useNavigateToCourseDetail,
} from '../../../hooks/useCourses';
import { useCultureContentDetail } from '../../../hooks/useCultureContentDetail';
import { useEditFestival } from '../../../hooks/useEditFestival';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useIsAdmin } from '../../../hooks/useMyProfile';
import {
  formatTodayOpeningHours,
  usePlaceOpeningHours,
} from '../../../hooks/usePlaceOpeningHours';
import { useAuthStore } from '../../../store/auth.store';
import { toContentTagIds } from '../../../utils/contentTags';
import {
  toCompanionLabel,
  toDurationLabel,
  toTransportLabel,
} from '../../../utils/courseEnumLabels';
import { buildFestivalCoursesPath } from '../../../utils/routes';
import { saveRecentCultureContent } from '../../../utils/recentCultureContents';

import {
  DetailDescriptionCard,
  DetailHeroSection,
  DetailInfoCard,
  DetailPlaceCard,
  DetailStateGuard,
  DetailTitleSection,
  FavoriteButton,
  ShareButton,
  ShareToast,
} from '../components';
import { mapCultureContentDetailToFestivalDetail } from '../mappers/cultureContentDetailMapper';
import { toSafeExternalUrl, toTelHref } from '../mappers/festivalDetailMapper';
import { useShareToast } from '../hooks/useShareToast';

const PAGE_PADDING_BOTTOM = 32;
const BACK_BUTTON_TOP = 12;
const BACK_BUTTON_LEFT = 24;
const TITLE_SECTION_PADDING_TOP = 15;
const SECTION_MARGIN_TOP = 16;
const INFO_CARD_MARGIN_TOP = 24;
const MAP_MARGIN_TOP = 24;
const PLACE_CARD_MARGIN_TOP = 4;
const COURSE_SECTION_MARGIN_TOP = 12;
const COURSE_LIST_MARGIN_TOP = 24;
const COURSE_CARD_GAP = 16;
const RELATED_COURSE_PREVIEW_COUNT = 2;
const RELATED_COURSE_SKELETON_ITEMS = [0, 1];
const MAP_FALLBACK_HEIGHT = 342;
const MAP_FALLBACK_RADIUS = 12;
const MAP_FALLBACK_FONT_SIZE = 14;

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

function FestivalDetailContent({ contentId }: { contentId: number }) {
  const navigate = useNavigate();
  const location = useLocation();
  const scale = useGlobalScale();
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

  return (
    <>
      <DetailStateGuard
        error={contentError ? '행사 정보를 불러오지 못했습니다.' : null}
        data={festival}
      >
        {(festivalDetail) => {
          const mapCenter = festivalDetail.place.location;
          const canManageFestival = festivalDetail.canManage || isAdmin;

          return (
            <ResponsivePageShell
              mode="main-layout"
              bottomPadding={PAGE_PADDING_BOTTOM}
              className="bg-white"
            >
              <ResponsiveFullBleed>
                <div className="relative">
                  <DetailHeroSection
                    imageUrl={festivalDetail.heroImageUrl}
                    title={festivalDetail.title}
                    rightAction={
                      canManageFestival ? (
                        <ReviewActionMenu
                          onEditClick={() => void editFestival(contentId)}
                          onDeleteClick={() => requestDelete(contentId)}
                          triggerClassName=""
                          triggerSize={28}
                          ariaLabel="행사 메뉴"
                        />
                      ) : (
                        <FavoriteButton
                          isActive={getLiked(contentId, festivalDetail.liked)}
                          label={festivalDetail.title}
                          onClick={handleFavoriteToggle}
                        />
                      )
                    }
                  />
                  <div
                    className="absolute z-10"
                    style={{
                      top: BACK_BUTTON_TOP * scale,
                      left: BACK_BUTTON_LEFT * scale,
                    }}
                  >
                    <BackButton onClick={handleBack} />
                  </div>
                </div>
              </ResponsiveFullBleed>

              <div style={{ paddingTop: TITLE_SECTION_PADDING_TOP * scale }}>
                <DetailTitleSection
                  title={festivalDetail.title}
                  tags={festivalDetail.tags}
                  action={
                    <ShareButton
                      onClick={handleShare}
                      label={`${festivalDetail.title} 공유하기`}
                    />
                  }
                />
              </div>

              <ShareToast copied={copied} isToastVisible={isToastVisible} />

              <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
                <DetailDescriptionCard
                  title="행사 소개"
                  content={festivalDetail.overview}
                />
              </section>

              <section style={{ marginTop: INFO_CARD_MARGIN_TOP * scale }}>
                <DetailInfoCard
                  address={festivalDetail.address}
                  hours={festivalDetail.period}
                  phone={festivalDetail.phone}
                  website={festivalDetail.homepageLabel}
                  phoneHref={toTelHref(festivalDetail.phone)}
                  websiteHref={toSafeExternalUrl(festivalDetail.homepageUrl)}
                />
              </section>

              <div style={{ marginTop: MAP_MARGIN_TOP * scale }}>
                {mapCenter ? (
                  <BaseKakaoMap
                    center={mapCenter}
                    markers={[mapCenter]}
                    imageMarkers={
                      festivalDetail.place.image
                        ? [
                            {
                              location: mapCenter,
                              imageUrl: festivalDetail.place.image,
                            },
                          ]
                        : []
                    }
                    focusedLocation={focusedPlaceLocation}
                    onMarkerClick={() =>
                      openKakaoMapRoute(festivalDetail.place.name, mapCenter)
                    }
                  />
                ) : (
                  <div
                    role="status"
                    className="bg-gray-2 text-gray-4 flex w-full items-center justify-center"
                    style={{
                      height: MAP_FALLBACK_HEIGHT * scale,
                      borderRadius: MAP_FALLBACK_RADIUS * scale,
                      fontSize: MAP_FALLBACK_FONT_SIZE * scale,
                    }}
                  >
                    등록된 행사 위치 정보가 없습니다.
                  </div>
                )}
              </div>

              <div style={{ marginTop: PLACE_CARD_MARGIN_TOP * scale }}>
                <DetailPlaceCard
                  imageUrl={festivalDetail.place.image}
                  title={festivalDetail.place.name}
                  address={festivalDetail.place.address}
                  hours={festivalPlaceHours ?? '영업시간 정보 없음'}
                  liked={placeLikedOverride ?? festivalDetail.place.liked}
                  relaxedSpacing
                  onLikeClick={() => void handlePlaceLikeToggle()}
                  onClick={
                    isValidGeoPoint(festivalDetail.place.location)
                      ? () => {
                          const location = festivalDetail.place.location;
                          if (isValidGeoPoint(location)) {
                            setFocusedPlaceLocation({ ...location });
                          }
                        }
                      : undefined
                  }
                />
              </div>

              {festivalDetail.relatedCourses.length > 0 ? (
                <>
                  <div style={{ marginTop: COURSE_SECTION_MARGIN_TOP * scale }}>
                    <SectionHeader
                      title="이 행사가 포함된 코스"
                      actionText="전체보기"
                      onActionClick={() =>
                        navigate(buildFestivalCoursesPath(contentId))
                      }
                    />
                  </div>

                  <div
                    className="flex flex-col"
                    style={{
                      marginTop: COURSE_LIST_MARGIN_TOP * scale,
                      gap: COURSE_CARD_GAP * scale,
                    }}
                  >
                    {isRelatedCoursesPending
                      ? RELATED_COURSE_SKELETON_ITEMS.map((item) => (
                          <CourseCardSkeleton key={item} />
                        ))
                      : previewCoursesWithTags.map((course) => (
                          <CourseCard
                            key={course.id}
                            image={course.image}
                            title={course.title}
                            duration={course.duration}
                            courseType={course.courseType}
                            companion={course.companion}
                            tags={[...course.tags]}
                            liked={getCourseLiked(course.id, course.liked)}
                            onClick={() => void goToCourseDetail(course.id)}
                            onLikeClick={() =>
                              toggleCourseLike(
                                course.id,
                                getCourseLiked(course.id, course.liked)
                              )
                            }
                          />
                        ))}
                  </div>
                </>
              ) : null}
            </ResponsivePageShell>
          );
        }}
      </DetailStateGuard>
      <FestivalDeleteDialog {...dialogProps} />
    </>
  );
}

function FestivalDetailPage() {
  const { festivalId } = useParams<{ festivalId?: string }>();
  const contentId = Number(festivalId);

  return <FestivalDetailContent key={festivalId} contentId={contentId} />;
}

export default FestivalDetailPage;
