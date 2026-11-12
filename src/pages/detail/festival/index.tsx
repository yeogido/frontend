import { useParams } from 'react-router-dom';

import {
  FestivalDeleteDialog,
  ReviewActionMenu,
} from '../../../components/common';
import CourseCard from '../../../components/common/CourseCard';
import CourseCardSkeleton from '../../../components/common/CourseCardSkeleton';
import SectionHeader from '../../../components/common/SectionHeader';
import BackButton from '../../local-recommendation/components/BackButton';
import BaseKakaoMap from '../../../components/kakaomap/BaseKakaoMap';
import { isValidGeoPoint } from '../../../components/kakaomap/types';
import { openKakaoMapRoute } from '../../../components/kakaomap/utils/kakaoMapLink';
import {
  ResponsiveFullBleed,
  ResponsivePageShell,
} from '../../../components/layout/ResponsivePageShell';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

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
import { toSafeExternalUrl, toTelHref } from '../mappers/festivalDetailMapper';
import { useFestivalDetail } from './hooks/useFestivalDetail';

const PAGE_PADDING_BOTTOM = 32;
const BACK_BUTTON_TOP = 12;
const BACK_BUTTON_LEFT = 24;
const TITLE_SECTION_PADDING_TOP = 24;
const SECTION_MARGIN_TOP = 16;
const INFO_CARD_MARGIN_TOP = 24;
const MAP_MARGIN_TOP = 24;
const PLACE_CARD_MARGIN_TOP = 4;
const COURSE_SECTION_MARGIN_TOP = 12;
const COURSE_LIST_MARGIN_TOP = 24;
const COURSE_CARD_GAP = 16;
const RELATED_COURSE_SKELETON_ITEMS = [0, 1];
const MAP_FALLBACK_HEIGHT = 342;
const MAP_FALLBACK_RADIUS = 12;
const MAP_FALLBACK_FONT_SIZE = 14;

function FestivalDetailContent({ contentId }: { contentId: number }) {
  const scale = useGlobalScale();
  const {
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
  } = useFestivalDetail(contentId);

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
                  title={festivalDetail.place.name}
                  address={festivalDetail.place.address}
                  hours={festivalPlaceHours ?? '영업시간 정보 없음'}
                  liked={placeLikedOverride ?? festivalDetail.place.liked}
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
                      onActionClick={goToRelatedCourses}
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
