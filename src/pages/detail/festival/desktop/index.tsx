import { useParams } from 'react-router-dom';
import {
  MdAccessTimeFilled,
  MdChevronRight,
  MdLocationOn,
  MdPhone,
  MdPublic,
} from 'react-icons/md';

import { FestivalDeleteDialog } from '../../../../components/common';
import BaseKakaoMap from '../../../../components/kakaomap/BaseKakaoMap';
import { isValidGeoPoint } from '../../../../components/kakaomap/types';
import { openKakaoMapRoute } from '../../../../components/kakaomap/utils/kakaoMapLink';
import DesktopPageShell from '../../../../components/layout/desktop/DesktopPageShell';
import { ShareToast } from '../../components';
import {
  toSafeExternalUrl,
  toTelHref,
} from '../../mappers/festivalDetailMapper';
import CourseDesktopCard from '../../desktop/CourseDesktopCard';
import DetailDesktopLayout, {
  type DetailInfoRow,
} from '../../desktop/DetailDesktopLayout';
import DetailTitleActions from '../../desktop/DetailTitleActions';
import { useFestivalDetail } from '../hooks/useFestivalDetail';

// Figma 1440 데스크톱 시안(6242:29073) 기준 리터럴 px.
const COURSE_SKELETON_ITEMS = [0, 1];
const COURSE_SKELETON_HEIGHT = 270;

function FestivalDetailDesktopContent({ contentId }: { contentId: number }) {
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
    editFestival,
    requestDelete,
    dialogProps,
  } = useFestivalDetail(contentId);

  if (contentError || !festival) {
    return (
      <DesktopPageShell>
        <p
          role={contentError ? 'alert' : 'status'}
          className="text-gray-4 py-[120px] text-center text-[18px]"
        >
          {contentError ? '행사 정보를 불러오지 못했습니다.' : '불러오는 중...'}
        </p>
      </DesktopPageShell>
    );
  }

  const mapCenter = festival.place.location;
  const canManage = festival.canManage || isAdmin;
  const phoneHref = toTelHref(festival.phone);
  const homepageHref = toSafeExternalUrl(festival.homepageUrl);

  const infoRows: DetailInfoRow[] = [
    { icon: MdLocationOn, text: festival.address },
    { icon: MdAccessTimeFilled, text: festival.period },
    { icon: MdPhone, text: festival.phone, href: phoneHref },
    { icon: MdPublic, text: festival.homepageLabel, href: homepageHref },
  ].filter((row) => row.text !== '');

  return (
    <>
      <DetailDesktopLayout
        heroImageUrls={festival.heroImageUrl ? [festival.heroImageUrl] : []}
        title={festival.title}
        overview={festival.overview}
        tags={festival.tags}
        titleActions={
          <DetailTitleActions
            manage={
              canManage
                ? {
                    label: '행사 메뉴',
                    onEdit: () => void editFestival(contentId),
                    onDelete: () => requestDelete(contentId),
                  }
                : undefined
            }
            like={
              canManage
                ? undefined
                : {
                    active: getLiked(contentId, festival.liked),
                    label: festival.title,
                    onClick: handleFavoriteToggle,
                  }
            }
            shareLabel={`${festival.title} 공유하기`}
            onShare={handleShare}
            shareFirst
          />
        }
        infoRows={infoRows}
        map={
          mapCenter ? (
            <BaseKakaoMap
              center={mapCenter}
              markers={[mapCenter]}
              imageMarkers={
                festival.place.image
                  ? [{ location: mapCenter, imageUrl: festival.place.image }]
                  : []
              }
              focusedLocation={focusedPlaceLocation}
              onMarkerClick={() =>
                openKakaoMapRoute(festival.place.name, mapCenter)
              }
            />
          ) : (
            <div
              role="status"
              className="bg-gray-2 text-gray-4 flex h-[424px] w-full items-center justify-center rounded-[24px] text-[16px]"
            >
              등록된 행사 위치 정보가 없습니다.
            </div>
          )
        }
        place={{
          name: festival.place.name,
          address: festival.place.address,
          hours: festivalPlaceHours ?? '영업시간 정보 없음',
          liked: placeLikedOverride ?? festival.place.liked,
          onLikeClick: () => void handlePlaceLikeToggle(),
          onClick: isValidGeoPoint(festival.place.location)
            ? () => {
                const location = festival.place.location;
                if (isValidGeoPoint(location)) {
                  setFocusedPlaceLocation({ ...location });
                }
              }
            : undefined,
        }}
      >
        {festival.relatedCourses.length > 0 ? (
          <section className="mt-[36px] flex flex-col gap-[16px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-black">
                이 행사가 포함된 코스
              </h2>
              <button
                type="button"
                onClick={goToRelatedCourses}
                className="text-gray-5 flex items-center text-[16px]"
              >
                전체보기
                <MdChevronRight aria-hidden="true" className="text-[20px]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-[24px]">
              {isRelatedCoursesPending
                ? COURSE_SKELETON_ITEMS.map((item) => (
                    <div
                      key={item}
                      aria-hidden="true"
                      style={{ height: COURSE_SKELETON_HEIGHT }}
                      className="bg-gray-2 animate-pulse rounded-[12px]"
                    />
                  ))
                : previewCoursesWithTags.map((course) => (
                    <CourseDesktopCard
                      key={course.id}
                      image={course.image}
                      title={course.title}
                      duration={course.duration}
                      courseType={course.courseType}
                      companion={course.companion}
                      tags={course.tags}
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
          </section>
        ) : null}
      </DetailDesktopLayout>

      <ShareToast copied={copied} isToastVisible={isToastVisible} />
      <FestivalDeleteDialog {...dialogProps} />
    </>
  );
}

/** 행사 상세의 데스크톱 뷰. 라우트 파라미터가 바뀌면 상태가 남지 않게 key로 다시 마운트한다. */
function FestivalDetailDesktopPage() {
  const { festivalId } = useParams<{ festivalId?: string }>();
  const contentId = Number(festivalId);

  return (
    <FestivalDetailDesktopContent key={festivalId} contentId={contentId} />
  );
}

export default FestivalDetailDesktopPage;
