import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  CourseCard,
  LoadingSpinner,
  SearchTriggerButton,
  SectionHeader,
} from '../../components/common';

import calendar from '../../assets/icons/calendar.svg';
import location from '../../assets/icons/location.svg';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useCourses, useRecommendedCourses } from '../../hooks/useCourses';
import { useCourseLikeToggle } from '../../hooks/useCourseLikeToggle';
import { useRecentCourses } from '../../hooks/useRecentCourses';
import { toContentTagIds } from '../../utils/contentTags';
import { toCourseCardProps } from '../../utils/courseCard';
import type { CourseDurationType } from '../../types/course.type';

const COURSE_REGION_SEARCH_PATH = '/course-region-search';
const COURSE_REGION_SEARCH_FROM_COURSE = '?from=course';
const POPULAR_COURSE_PREVIEW_COUNT = 2;
const POPULAR_COURSE_SKELETON_ITEMS = [0, 1];
const RECENT_COURSE_PREVIEW_COUNT = 2;

const durationLabelByType: Record<CourseDurationType, string> = {
  DAY_TRIP: '당일치기',
  ONE_NIGHT: '1박 2일',
  TWO_NIGHT: '2박 3일',
  THREE_PLUS: '3박 이상',
};

// /courses/recommended 문서와 실제 응답의 enum 표기가 엇갈릴 수 있어(ONE_DAY/MORE 등),
// 알려진 값은 정상 라벨로 보여주고 모르는 값은 원문을 그대로 보여준다.
const HERO_DURATION_LABEL_BY_TYPE: Record<string, string> = {
  DAY_TRIP: '당일치기',
  ONE_DAY: '당일치기',
  ONE_NIGHT: '1박 2일',
  TWO_NIGHT: '2박 3일',
  THREE_PLUS: '3박 이상',
  MORE: '3박 이상',
};

const HERO_TRANSPORT_LABEL_BY_TYPE: Record<string, string> = {
  WALK: '뚜벅이 코스',
  PUBLIC: '대중교통 코스',
  CAR: '드라이브 코스',
};

const DEFAULT_HERO_TITLE = '8월의 순천 힐링 여행';
const DEFAULT_HERO_DESCRIPTION =
  '자연과 사람, 로컬 문화를 천천히 경험하며 순천만의 매력을 느껴보세요.';
const DEFAULT_HERO_DURATION_LABEL = '2박 3일';
const DEFAULT_HERO_TRANSPORT_LABEL = '뚜벅이 코스';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;

const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 6;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;

const SEARCH_MARGIN_TOP = 11;
const HERO_MARGIN_TOP = 12;
const HERO_HEIGHT = 129;
const HERO_RADIUS = 12;
const HERO_TITLE_TOP = 24;
const HERO_TITLE_LEFT = 16;
const HERO_TITLE_WIDTH = 163;
const HERO_TITLE_SIZE = 15;
const HERO_TITLE_LINE_HEIGHT = 19;
const HERO_DESCRIPTION_MARGIN_TOP = 10;
const HERO_DESCRIPTION_SIZE = 10;
const HERO_DESCRIPTION_LINE_HEIGHT = 12;
const HERO_META_BOTTOM = 14;
const HERO_META_LEFT = 16;
const HERO_META_GAP = 10;
const HERO_META_ITEM_GAP = 2;
const HERO_META_SIZE = 10;
const HERO_META_LINE_HEIGHT = 12;
const HERO_ICON_SIZE = 14;

const SECTION_MARGIN_TOP = 32;
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 16;
const ERROR_MARGIN_TOP = 16;
const ERROR_TEXT_SIZE = 13;

function YeogidoCoursePage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const {
    data: popularCourses,
    isPending: isPopularCoursesPending,
    isError: isPopularCoursesError,
    refetch: refetchPopularCourses,
  } = useCourses({
    courseType: 'OFFICIAL',
    sort: 'RECOMMEND',
    size: POPULAR_COURSE_PREVIEW_COUNT,
  });
  const popularCoursePreviews = (
    popularCourses?.pages[0]?.items ?? []
  ).slice(0, POPULAR_COURSE_PREVIEW_COUNT);
  const recentCoursePreviews = useRecentCourses()
    .slice(0, RECENT_COURSE_PREVIEW_COUNT)
    .map(toCourseCardProps);
  const {
    data: recommendedCourses,
    isPending: isRecommendedCoursesPending,
    isError: isRecommendedCoursesError,
    refetch: refetchRecommendedCourses,
  } = useRecommendedCourses();
  const heroCourse = recommendedCourses?.[0];
  const heroTitle = heroCourse?.title ?? DEFAULT_HERO_TITLE;
  const heroDescription = heroCourse?.description ?? DEFAULT_HERO_DESCRIPTION;
  const heroDurationLabel = heroCourse
    ? (HERO_DURATION_LABEL_BY_TYPE[heroCourse.durationType] ??
      heroCourse.durationType)
    : DEFAULT_HERO_DURATION_LABEL;
  const heroTransportLabel = heroCourse
    ? (HERO_TRANSPORT_LABEL_BY_TYPE[heroCourse.transportType] ??
      heroCourse.transportType)
    : DEFAULT_HERO_TRANSPORT_LABEL;

  const goToCourseRegionSearch = () => {
    navigate(`${COURSE_REGION_SEARCH_PATH}${COURSE_REGION_SEARCH_FROM_COURSE}`);
  };

  const goToPopularCourses = () => {
    navigate('/yeogido-course/popular');
  };

  const goToRecentCourses = () => {
    navigate('/yeogido-course/recent');
  };

  const goToCourseDetail = (courseId: number | string) => {
    navigate(`/yeogido-course/detail/${courseId}`);
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
          여기도 가볼까?
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          새로운 여행지를 발견해 보세요
        </p>
      </div>

      <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
        <SearchTriggerButton
          label="코스명 또는 지역명 검색 화면으로 이동"
          placeholder="코스명 또는 지역명을 검색해 주세요"
          onClick={goToCourseRegionSearch}
        />
      </div>

      {isRecommendedCoursesPending ? (
        <div
          className="flex items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#8EA98C_0%,#507047_100%)]"
          style={{
            height: HERO_HEIGHT * scale,
            marginTop: HERO_MARGIN_TOP * scale,
            borderRadius: HERO_RADIUS * scale,
          }}
        >
          <LoadingSpinner label="추천 코스를 불러오는 중" />
        </div>
      ) : isRecommendedCoursesError ? (
        <div
          className="bg-gray-1 flex flex-col items-center justify-center gap-3 overflow-hidden"
          style={{
            height: HERO_HEIGHT * scale,
            marginTop: HERO_MARGIN_TOP * scale,
            borderRadius: HERO_RADIUS * scale,
          }}
        >
          <p
            className="text-gray-4 text-center font-medium"
            style={{ fontSize: ERROR_TEXT_SIZE * scale }}
          >
            추천 코스를 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={() => void refetchRecommendedCourses()}
            className="rounded-full border border-[#e4e4e4] px-4 py-2 text-[14px] font-medium text-[#505050]"
          >
            다시 시도
          </button>
        </div>
      ) : (
      <button
        type="button"
        onClick={() =>
          heroCourse
            ? goToCourseDetail(heroCourse.courseId)
            : goToCourseRegionSearch()
        }
        className="block w-full overflow-hidden text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          marginTop: HERO_MARGIN_TOP * scale,
          borderRadius: HERO_RADIUS * scale,
        }}
      >
        <div
          className="relative overflow-hidden bg-[linear-gradient(180deg,#8EA98C_0%,#507047_100%)]"
          style={{ height: HERO_HEIGHT * scale }}
        >
          {heroCourse?.thumbnailUrl ? (
            <img
              src={heroCourse.thumbnailUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.45),rgba(0,0,0,0.05))]" />
          <div
            className="text-pure-white absolute"
            style={{
              top: HERO_TITLE_TOP * scale,
              left: HERO_TITLE_LEFT * scale,
              width: HERO_TITLE_WIDTH * scale,
            }}
          >
            <p
              className="font-semibold"
              style={{
                fontSize: HERO_TITLE_SIZE * scale,
                lineHeight: `${HERO_TITLE_LINE_HEIGHT * scale}px`,
              }}
            >
              {heroTitle}
            </p>
            <p
              className="text-pure-white/85 font-normal"
              style={{
                marginTop: HERO_DESCRIPTION_MARGIN_TOP * scale,
                fontSize: HERO_DESCRIPTION_SIZE * scale,
                lineHeight: `${HERO_DESCRIPTION_LINE_HEIGHT * scale}px`,
              }}
            >
              {heroDescription}
            </p>
          </div>
          <div
            className="text-pure-white absolute flex items-center font-medium"
            style={{
              bottom: HERO_META_BOTTOM * scale,
              left: HERO_META_LEFT * scale,
              gap: HERO_META_GAP * scale,
              fontSize: HERO_META_SIZE * scale,
              lineHeight: `${HERO_META_LINE_HEIGHT * scale}px`,
            }}
          >
            <span
              className="flex items-center"
              style={{ gap: HERO_META_ITEM_GAP * scale }}
            >
              <img
                src={calendar}
                alt=""
                aria-hidden="true"
                className="brightness-0 invert"
                style={{
                  width: HERO_ICON_SIZE * scale,
                  height: HERO_ICON_SIZE * scale,
                }}
              />
              {heroDurationLabel}
            </span>
            <span
              className="flex items-center"
              style={{ gap: HERO_META_ITEM_GAP * scale }}
            >
              <img
                src={location}
                alt=""
                aria-hidden="true"
                className="brightness-0 invert"
                style={{
                  width: HERO_ICON_SIZE * scale,
                  height: HERO_ICON_SIZE * scale,
                }}
              />
              {heroTransportLabel}
            </span>
          </div>
        </div>
      </button>
      )}

      <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
        <SectionHeader
          title="인기 추천 코스"
          actionText="자세히 보기"
          onActionClick={goToPopularCourses}
        />

        <div
          className="flex [scrollbar-width:none] overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            gap: LIST_GAP * scale,
          }}
        >
          {isPopularCoursesPending
            ? POPULAR_COURSE_SKELETON_ITEMS.map((item) => (
                <ContentCardSkeleton key={item} />
              ))
            : popularCoursePreviews.map((course) => (
                <ContentCard
                  key={course.courseId}
                  image={course.thumbnailUrl}
                  title={course.title}
                  firstInfo={durationLabelByType[course.durationType]}
                  secondInfo={course.region}
                  tags={toContentTagIds(course.tags)}
                  liked={getLiked(course.courseId, course.isLiked)}
                  onClick={() => goToCourseDetail(course.courseId)}
                  onLikeClick={() =>
                    toggleLike(
                      course.courseId,
                      getLiked(course.courseId, course.isLiked)
                    )
                  }
                />
              ))}
        </div>

        {!isPopularCoursesPending && isPopularCoursesError ? (
          <div
            className="flex flex-col items-center"
            style={{
              marginTop: ERROR_MARGIN_TOP * scale,
              gap: ERROR_MARGIN_TOP * scale,
            }}
          >
            <p
              className="text-main-5 text-center font-medium"
              style={{ fontSize: ERROR_TEXT_SIZE * scale }}
            >
              코스 목록을 불러오지 못했어요.
            </p>
            <button
              type="button"
              onClick={() => void refetchPopularCourses()}
              className="rounded-full border border-[#e4e4e4] px-4 py-2 text-[14px] font-medium text-[#505050]"
            >
              다시 시도
            </button>
          </div>
        ) : null}
      </section>

      {recentCoursePreviews.length > 0 ? (
        <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
          <SectionHeader
            title="최근 본 코스"
            actionText="전체 보기"
            onActionClick={goToRecentCourses}
          />

          <div
            className="grid grid-cols-1"
            style={{
              marginTop: LIST_MARGIN_TOP * scale,
              gap: LIST_GAP * scale,
            }}
          >
            {recentCoursePreviews.map((course) => (
              <div key={course.id} className="w-full">
                <CourseCard
                  {...course}
                  liked={getLiked(course.id, course.liked)}
                  onClick={() => goToCourseDetail(course.id)}
                  onLikeClick={() =>
                    toggleLike(course.id, getLiked(course.id, course.liked))
                  }
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

export default YeogidoCoursePage;
