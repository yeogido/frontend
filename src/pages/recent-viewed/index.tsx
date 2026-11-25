import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  ContentCard,
  CourseFilterBar,
  FestivalContentCard,
} from '../../components/common';
import {
  getMyPostFilterColumnClassName,
  MY_POST_FILTER_GRID_CLASS_NAME,
} from '../../constants/courseFilterLayout';
import { useContentLikeToggle } from '../../hooks/useContentLikeToggle';
import { useCourseLikeToggle } from '../../hooks/useCourseLikeToggle';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useRecentCourses } from '../../hooks/useRecentCourses';
import { useRecentCultureContents } from '../../hooks/useRecentCultureContents';
import { useRecentPromotions } from '../../hooks/useRecentPromotions';
import { toContentTagIds } from '../../utils/contentTags';
import { toCourseCardProps } from '../../utils/courseCard';
import {
  buildCourseDetailPath,
  buildFestivalDetailPath,
  buildLocalBusinessDetailPath,
} from '../../utils/routes';
import { toDistanceLabel } from '../likes/utils/likedItems';
import {
  isRecentCategory,
  RECENT_CATEGORY_OPTIONS,
  type RecentCategory,
} from './constants';
import { useRecentPromotionLike } from './hooks/useRecentPromotionLike';
import { useUserLocation } from './hooks/useUserLocation';
import { mergeRecentViewed, toRecentPromotionInfo } from './utils';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;
const FILTER_MARGIN_TOP = 16;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const EMPTY_MARGIN_TOP = 40;
const EMPTY_TEXT_SIZE = 13;

const filterGroups = [{ key: 'category', options: RECENT_CATEGORY_OPTIONS }];

const noop = () => undefined;

/**
 * 모바일 최근 본 게시물 — 상세 화면을 열었을 때 저장해 둔 코스·행사·소상공인
 * 홍보글을 같은 크기의 카드 2열로 보여준다. 홍보글 카드는 시안(6958:51712)의
 * 장소 카드처럼 태그 없이 영업시간·지역·거리를 보여준다. 목록은
 * 브라우저(localStorage)에 있어서 이 기기·이 계정에서 본 것만 나온다. '전체'는
 * 본 시각 최신순으로 섞어 보여준다.
 */
function RecentViewedPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const category: RecentCategory = isRecentCategory(categoryParam)
    ? categoryParam
    : '전체';

  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (filterContainerRef.current?.contains(event.target as Node)) return;

      setIsFilterOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isFilterOpen]);

  const recentCourses = useRecentCourses();
  const recentContents = useRecentCultureContents();
  const recentPromotions = useRecentPromotions();
  const togglePromotionLike = useRecentPromotionLike();
  const { getLiked: getCourseLiked, toggleLike: toggleCourseLike } =
    useCourseLikeToggle();
  const { getLiked: getContentLiked, toggleLike: toggleContentLike } =
    useContentLikeToggle();

  const showCourses = category === '전체' || category === '코스';
  const showContents = category === '전체' || category === '행사';
  const showPromotions = category === '전체' || category === '홍보게시물';
  const items = mergeRecentViewed(
    showCourses ? recentCourses : [],
    showContents ? recentContents : [],
    showPromotions ? recentPromotions : []
  );
  const isEmpty = items.length === 0;
  const userLocation = useUserLocation(
    showPromotions && recentPromotions.length > 0
  );

  const handleCategorySelect = (_: string, option: string) => {
    if (!isRecentCategory(option)) return;

    const nextParams = new URLSearchParams(searchParams);

    if (option === '전체') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', option);
    }

    setSearchParams(nextParams, { replace: true });
    setIsFilterOpen(false);
  };

  return (
    <section
      className="mx-auto flex min-h-screen w-full flex-col"
      style={{
        paddingLeft: PAGE_PADDING_X * scale,
        paddingRight: PAGE_PADDING_X * scale,
        paddingTop: PAGE_PADDING_TOP * scale,
        paddingBottom: PAGE_PADDING_BOTTOM * scale,
      }}
    >
      <div>
        <h1
          className="font-semibold text-black"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          최근 본 게시물
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          최근 확인한 게시물을 다시 둘러보세요
        </p>
      </div>

      <CourseFilterBar
        filterGroups={filterGroups}
        selectedFilters={{ category }}
        openFilterKey={isFilterOpen ? 'category' : null}
        filterContainerRef={filterContainerRef}
        gridClassName={MY_POST_FILTER_GRID_CLASS_NAME}
        getColumnClassName={getMyPostFilterColumnClassName}
        marginTop={FILTER_MARGIN_TOP}
        onToggle={() => setIsFilterOpen((isOpen) => !isOpen)}
        onSelect={handleCategorySelect}
      />

      {isEmpty ? (
        <p
          role="status"
          className="text-gray-4 text-center font-medium"
          style={{
            marginTop: EMPTY_MARGIN_TOP * scale,
            fontSize: EMPTY_TEXT_SIZE * scale,
          }}
        >
          최근 본 게시물이 없습니다.
        </p>
      ) : (
        <div
          className="grid grid-cols-2"
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            columnGap: LIST_GAP * scale,
            rowGap: LIST_GAP * scale,
          }}
        >
          {items.map((item) => {
            if (item.kind === 'content') {
              const { content } = item;

              return (
                <FestivalContentCard
                  key={`content-${content.contentId}`}
                  image={content.thumbnailImageUrl || null}
                  title={content.title}
                  startDate={content.startDate}
                  endDate={content.endDate}
                  regionName={content.regionName}
                  tags={toContentTagIds(content.hashtags)}
                  className="w-full"
                  isAdmin={false}
                  liked={getContentLiked(content.contentId, content.liked)}
                  onClick={() =>
                    navigate(buildFestivalDetailPath(content.contentId))
                  }
                  onLikeClick={() =>
                    toggleContentLike(
                      content.contentId,
                      getContentLiked(content.contentId, content.liked)
                    )
                  }
                  onEdit={noop}
                  onDelete={noop}
                />
              );
            }

            if (item.kind === 'promotion') {
              const { promotion } = item;
              const { hoursLabel, distanceKm } = toRecentPromotionInfo(
                promotion,
                userLocation
              );

              return (
                <ContentCard
                  key={`promotion-${promotion.promotionId}`}
                  image={promotion.image || null}
                  title={promotion.title}
                  firstInfo={hoursLabel}
                  secondInfo={promotion.location}
                  distanceInfo={toDistanceLabel(distanceKm)}
                  liked={promotion.liked}
                  className="w-full"
                  onClick={() =>
                    navigate(
                      buildLocalBusinessDetailPath(promotion.promotionId)
                    )
                  }
                  onLikeClick={() => void togglePromotionLike(promotion)}
                />
              );
            }

            const recentCourse = item.course;
            const course = toCourseCardProps(recentCourse);

            return (
              <ContentCard
                key={`course-${course.id}`}
                image={course.image}
                title={course.title}
                firstInfo={course.duration}
                secondInfo={course.courseType}
                thirdInfo={course.companion}
                tags={course.tags}
                liked={getCourseLiked(course.id, course.liked)}
                className="w-full"
                onClick={() =>
                  navigate(
                    buildCourseDetailPath(recentCourse.courseType, course.id)
                  )
                }
                onLikeClick={() =>
                  toggleCourseLike(
                    course.id,
                    getCourseLiked(course.id, course.liked)
                  )
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RecentViewedPage;
