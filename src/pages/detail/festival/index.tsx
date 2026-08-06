import {
  useEffect,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CourseCard from '../../../components/common/CourseCard';
import SectionHeader from '../../../components/common/SectionHeader';
import BaseKakaoMap from '../../../components/kakaomap/BaseKakaoMap';
import {
  ResponsiveFullBleed,
  ResponsivePageShell,
} from '../../../components/layout/ResponsivePageShell';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useContentLikeToggle } from '../../../hooks/useContentLikeToggle';
import { useCultureContentDetail } from '../../../hooks/useCultureContentDetail';
import { useLoginModal } from '../../../hooks/useLoginModal';
import {
  formatTodayOpeningHours,
  usePlaceOpeningHours,
} from '../../../hooks/usePlaceOpeningHours';
import { useAuthStore } from '../../../store/auth.store';
import { buildCourseSearchPath } from '../../../utils/routes';
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
import {
  toSafeExternalUrl,
  toTelHref,
} from '../mappers/festivalDetailMapper';
import { useShareToast } from '../hooks/useShareToast';

const PAGE_PADDING_BOTTOM = 32;
const TITLE_SECTION_PADDING_TOP = 15;
const SECTION_MARGIN_TOP = 16;
const INFO_CARD_MARGIN_TOP = 24;
const MAP_MARGIN_TOP = 24;
const PLACE_CARD_MARGIN_TOP = 4;
const COURSE_SECTION_MARGIN_TOP = 12;
const COURSE_LIST_MARGIN_TOP = 24;
const COURSE_CARD_GAP = 16;
const MAP_FALLBACK_HEIGHT = 342;
const MAP_FALLBACK_RADIUS = 12;
const MAP_FALLBACK_FONT_SIZE = 14;

function FestivalDetailContent({ contentId }: { contentId: number }) {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const isValidContentId = Number.isInteger(contentId) && contentId > 0;
  const {
    data: content,
    error: queryError,
  } = useCultureContentDetail(contentId);
  const contentError = isValidContentId
    ? queryError
    : new Error('Invalid content ID');
  const { getLiked, toggleLike } = useContentLikeToggle();
  const [placeLikedOverride, setPlaceLikedOverride] = useState<boolean | null>(
    null,
  );
  const [likedCourseIds, setLikedCourseIds] = useState<readonly number[]>([]);
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
      : [],
  );
  const festivalPlaceHours = festival
    ? formatTodayOpeningHours(
        openingHoursByPlaceId.get(festival.place.id) ?? {
          currentWeekdayDescriptions: [],
          regularWeekdayDescriptions: [],
        },
      )
    : undefined;

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

  const runAuthAction = (action: () => void) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    action();
  };

  const handleFavoriteToggle = () => {
    if (!festival) return;

    toggleLike(contentId, getLiked(contentId, festival.liked));
  };

  const handlePlaceLikeToggle = () => {
    runAuthAction(() =>
      setPlaceLikedOverride(
        (previous) => !(previous ?? festival?.place.liked ?? false),
      ),
    );
  };

  const handleCourseLikeToggle = (courseId: number) => {
    runAuthAction(() => {
      setLikedCourseIds((previousIds) =>
        previousIds.includes(courseId)
          ? previousIds.filter((id) => id !== courseId)
          : [...previousIds, courseId],
      );
    });
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
              <DetailHeroSection
                imageUrl={festivalDetail.heroImageUrl}
                title={festivalDetail.title}
                rightAction={
                  <FavoriteButton
                    isActive={getLiked(contentId, festivalDetail.liked)}
                    label={festivalDetail.title}
                    onClick={handleFavoriteToggle}
                  />
                }
              />
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
                hours={festivalPlaceHours ?? '영업시간 정보 없음'}
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
                onLikeClick={handlePlaceLikeToggle}
              />
            </div>

            {festivalDetail.relatedCourses.length > 0 ? (
              <>
                <div style={{ marginTop: COURSE_SECTION_MARGIN_TOP * scale }}>
                  <SectionHeader
                    title="이 행사가 포함된 코스"
                    actionText="전체보기"
                    onActionClick={() =>
                      navigate(buildCourseSearchPath(festivalDetail.place.name))
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
                  {festivalDetail.relatedCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      image={course.image}
                      title={course.title}
                      duration={course.duration}
                      courseType={course.courseType}
                      companion={course.companion}
                      tags={[...course.tags]}
                      liked={likedCourseIds.includes(course.id)}
                      onClick={() =>
                        navigate(`/yeogido-course/detail/${course.id}`)
                      }
                      onLikeClick={() => handleCourseLikeToggle(course.id)}
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
