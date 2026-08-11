import { useEffect, useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import {
  addPlaceLike,
  getCourseDetail,
  removePlaceLike,
} from '../../../apis/courses';
import type { NormalizedApiError } from '../../../apis/common';
import CourseCard from '../../../components/common/CourseCard';
import SectionHeader from '../../../components/common/SectionHeader';
import BackButton from '../../local-recommendation/components/BackButton';
import BaseKakaoMap from '../../../components/kakaomap/BaseKakaoMap';
import { isValidGeoPoint } from '../../../components/kakaomap/types';
import { openKakaoMapRoute } from '../../../components/kakaomap/utils/kakaoMapLink';
import {
  ResponsiveFullBleed,
  ResponsivePageShell,
} from '../../../components/layout/ResponsivePageShell';
import { useToast } from '../../../components/toast';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useCourseLikeToggle } from '../../../hooks/useCourseLikeToggle';
import { useNavigateToCourseDetail } from '../../../hooks/useCourses';
import { useCultureContentDetail } from '../../../hooks/useCultureContentDetail';
import { useEditFestival } from '../../../hooks/useEditFestival';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useIsAdmin } from '../../../hooks/useMyProfile';
import {
  formatTodayOpeningHours,
  usePlaceOpeningHours,
} from '../../../hooks/usePlaceOpeningHours';
import { isCourseNotFoundError } from '../../../hooks/useReviews';
import { useAuthStore } from '../../../store/auth.store';
import { toContentTagIds } from '../../../utils/contentTags';
import { buildFestivalCoursesPath } from '../../../utils/routes';
import { saveRecentCultureContent } from '../../../utils/recentCultureContents';

import {
  DetailDescriptionCard,
  DetailHeroSection,
  DetailInfoCard,
  DetailPlaceCard,
  DetailStateGuard,
  DetailTitleSection,
  EditButton,
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
const MAP_FALLBACK_HEIGHT = 342;
const MAP_FALLBACK_RADIUS = 12;
const MAP_FALLBACK_FONT_SIZE = 14;

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
  const isAdmin = useIsAdmin();
  const { editFestival } = useEditFestival();
  const [placeLikedOverride, setPlaceLikedOverride] = useState<boolean | null>(
    null
  );
  const placeLikeRequestInFlightRef = useRef(false);
  const { copied, isToastVisible, handleShare } = useShareToast();

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

  // 상세 응답의 courses에는 태그가 없어(다른 필드는 다 있다), 미리보기에
  // 보여줄 만큼(2개)만 코스 상세를 따로 받아 태그를 채운다.
  const previewCourses =
    festival?.relatedCourses.slice(0, RELATED_COURSE_PREVIEW_COUNT) ?? [];
  const previewCourseDetailQueries = useQueries({
    queries: previewCourses.map((course) => ({
      queryKey: ['courseDetail', course.id],
      queryFn: () => getCourseDetail(course.id),
      staleTime: 1000 * 60,
      // 삭제된 코스(COURSE4041)는 재시도해도 절대 성공하지 않는다 —
      // 기본 재시도(3회)를 두면 삭제 판정이 늦어지고 요청만 늘어난다.
      retry: (failureCount: number, error: unknown) =>
        !isCourseNotFoundError(error) && failureCount < 3,
    })),
  });
  // 행사에 코스가 연결된 뒤 그 코스가 삭제돼도 행사 쪽 목록에는 여전히
  // 남아 있을 수 있다(코스 상세 조회는 COURSE4041로 404) — 그런 항목은
  // 클릭해도 여는 게 불가능하니 상세 조회로 삭제를 확인하는 즉시 뺀다.
  const previewCoursesWithTags = previewCourses
    .map((course, index) => ({
      course,
      query: previewCourseDetailQueries[index],
    }))
    .filter(
      ({ query }) => !(query?.isError && isCourseNotFoundError(query.error))
    )
    .map(({ course, query }) => ({
      ...course,
      tags: toContentTagIds(query?.data?.tags ?? []),
    }));

  useEffect(() => {
    if (!content) return;

    saveRecentCultureContent({
      contentId: content.contentId,
      title: content.title,
      thumbnailImageUrl:
        content.thumbnailImageUrl ?? content.thumbnailImage ?? '',
      regionName: content.place.name,
      hashtags: content.hashtags,
      startDate: content.startDate,
      endDate: content.endDate,
      liked: content.liked,
    });
  }, [content]);

  const handleBack = () => {
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
    placeLikeRequestInFlightRef.current = true;
    setPlaceLikedOverride(nextLiked);

    try {
      if (nextLiked) {
        await addPlaceLike(festival.place.id, 'CONTENT', contentId);
      } else {
        await removePlaceLike(festival.place.id);
      }
    } catch (error) {
      setPlaceLikedOverride(!nextLiked);

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
    <DetailStateGuard
      error={contentError ? '행사 정보를 불러오지 못했습니다.' : null}
      data={festival}
    >
      {(festivalDetail) => {
        const mapCenter = festivalDetail.place.location;

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
                    isAdmin ? (
                      <EditButton
                        label={festivalDetail.title}
                        onClick={() => void editFestival(contentId)}
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
                <BaseKakaoMap center={mapCenter} markers={[mapCenter]} />
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
                onLikeClick={() => void handlePlaceLikeToggle()}
                onClick={
                  isValidGeoPoint(festivalDetail.place.location)
                    ? () =>
                        openKakaoMapRoute(
                          festivalDetail.place.name,
                          festivalDetail.place.location
                        )
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
                  {previewCoursesWithTags.map((course) => (
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
  );
}

function FestivalDetailPage() {
  const { festivalId } = useParams<{ festivalId?: string }>();
  const contentId = Number(festivalId);

  return <FestivalDetailContent key={festivalId} contentId={contentId} />;
}

export default FestivalDetailPage;
