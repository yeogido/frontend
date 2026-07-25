import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  CourseCard,
  FloatingActionButton,
  SearchTriggerButton,
  SectionHeader,
} from '../../components/common';
import { useGlobalScale } from '../../hooks/useGlobalScale';

import { CreateCourseBanner } from './components';
import useLocalCoursePreviews from './hooks/useLocalCoursePreviews';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;
const SEARCH_MARGIN_TOP = 12;
const BANNER_MARGIN_TOP = 12;
const SECTION_MARGIN_TOP = 32;
const LIST_MARGIN_TOP = 12;
const LIST_GAP = 16;

function LocalCoursePage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const { popularCourses, recentCourses } = useLocalCoursePreviews();

  const goToRegionSearch = () => {
    navigate('/course-region-search?from=local-course');
  };

  const goToCreateCourse = () => {
    navigate('/local-recommendation');
  };

  const goToPopularCourses = () => {
    navigate('/local-course/popular');
  };

  const goToRecentCourses = () => {
    navigate('/local-course/recent');
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
          우리동네 추천 코스
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          여행자들이 직접 만든 지역 경험 코스
        </p>
      </div>

      <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
        <SearchTriggerButton
          label="지역명 또는 도시명 검색 화면으로 이동"
          placeholder="지역명 또는 도시명을 검색해 주세요"
          onClick={goToRegionSearch}
        />
      </div>

      <div style={{ marginTop: BANNER_MARGIN_TOP * scale }}>
        <CreateCourseBanner onClick={goToCreateCourse} />
      </div>

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
          {popularCourses.map((course) => (
            <ContentCard
              key={course.id}
              image={course.image}
              title={course.title}
              firstInfo={course.duration}
              secondInfo={course.courseType}
              liked={course.liked}
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
          {recentCourses.map((course) => (
            <div key={course.id} className="w-full">
              <CourseCard {...course} />
            </div>
          ))}
        </div>
      </section>

      <FloatingActionButton ariaLabel="코스 만들기" onClick={goToCreateCourse} />
    </section>
  );
}

export default LocalCoursePage;
