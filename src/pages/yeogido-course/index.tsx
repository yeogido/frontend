import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  CourseCard,
  SearchTriggerButton,
  SectionHeader,
} from '../../components/common';

import calendar from '../../assets/icons/calendar.svg';
import location from '../../assets/icons/location.svg';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import courseMapImage from './assets/courseimage.svg';
import {
  yeogidoCoursePopularPreviews,
  yeogidoCourseRecentPreviews,
} from './constants/coursePreviews';

const COURSE_REGION_SEARCH_PATH = '/course-region-search';
const COURSE_REGION_SEARCH_FROM_COURSE = '?from=course';

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

function YeogidoCoursePage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();

  const goToCourseRegionSearch = () => {
    navigate(`${COURSE_REGION_SEARCH_PATH}${COURSE_REGION_SEARCH_FROM_COURSE}`);
  };

  const goToPopularCourses = () => {
    navigate('/yeogido-course/popular');
  };

  const goToRecentCourses = () => {
    navigate('/yeogido-course/recent');
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
          여기도 왔어요
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

      <button
        type="button"
        onClick={goToCourseRegionSearch}
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
              8월의 순천 힐링 여행
            </p>
            <p
              className="text-pure-white/85 font-normal"
              style={{
                marginTop: HERO_DESCRIPTION_MARGIN_TOP * scale,
                fontSize: HERO_DESCRIPTION_SIZE * scale,
                lineHeight: `${HERO_DESCRIPTION_LINE_HEIGHT * scale}px`,
              }}
            >
              자연과 사람, 로컬 문화를 천천히 경험하며 순천만의 매력을
              느껴보세요.
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
              2박 3일
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
              뚜벅이 코스
            </span>
          </div>
        </div>
      </button>

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
          {yeogidoCoursePopularPreviews.map((course) => (
            <ContentCard
              key={course.id}
              image={courseMapImage}
              title={course.title}
              firstInfo={course.duration}
              secondInfo={course.courseType}
              tags={course.tags}
            />
          ))}
        </div>
      </section>

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
          {yeogidoCourseRecentPreviews.map((course) => (
            <div key={course.id} className="w-full">
              <CourseCard {...course} onClick={goToCourseRegionSearch} />
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default YeogidoCoursePage;
