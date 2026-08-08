import { useNavigate } from 'react-router-dom';

import {
  EditableContentCard,
  EditableCourseCard,
  FloatingActionButton,
  SearchTriggerButton,
  SectionHeader,
} from '../../../components/common';
import calendar from '../../../assets/icons/calendar.svg';
import location from '../../../assets/icons/location.svg';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useAdminCourseRegistrationStore } from '../../../store/adminCourseRegistration.store';

import {
  mockHeroCourse,
  mockPopularCourseCards,
  mockRecentCourseCards,
} from './constants/mockCourseCards';

// yeogido-course 홈 화면과 동일한 구조(히어로 배너 + 인기 추천 코스 가로
// 스크롤 + 최근 본 코스 목록)를 그대로 재사용하고, 데이터만 Mock으로 채운다.
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

function AdminCoursesPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const resetRegistration = useAdminCourseRegistrationStore(
    (state) => state.reset
  );

  const handleStartRegistration = () => {
    resetRegistration();
    navigate('/admin/course-registration/region-selection');
  };

  const handleDeleteCourse = (courseId: string) => {
    console.log('코스 삭제:', courseId);
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
          여기도 추천 코스를 관리해 보세요
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          등록된 여기도 추천 코스를 확인하고 새로운 코스를 등록할 수 있어요
        </p>
      </div>

      <div style={{ marginTop: SEARCH_MARGIN_TOP * scale }}>
        <SearchTriggerButton
          label="코스명 또는 지역명 검색 화면으로 이동"
          placeholder="코스명 또는 지역명을 검색해 주세요"
          onClick={() => navigate('/course-region-search?from=course')}
        />
      </div>

      <div
        className="relative overflow-hidden bg-[linear-gradient(180deg,#8EA98C_0%,#507047_100%)]"
        style={{
          height: HERO_HEIGHT * scale,
          marginTop: HERO_MARGIN_TOP * scale,
          borderRadius: HERO_RADIUS * scale,
        }}
      >
        <img
          src={mockHeroCourse.thumbnailUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
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
            {mockHeroCourse.title}
          </p>
          <p
            className="text-pure-white/85 font-normal"
            style={{
              marginTop: HERO_DESCRIPTION_MARGIN_TOP * scale,
              fontSize: HERO_DESCRIPTION_SIZE * scale,
              lineHeight: `${HERO_DESCRIPTION_LINE_HEIGHT * scale}px`,
            }}
          >
            {mockHeroCourse.description}
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
              style={{ width: HERO_ICON_SIZE * scale, height: HERO_ICON_SIZE * scale }}
            />
            {mockHeroCourse.durationLabel}
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
              style={{ width: HERO_ICON_SIZE * scale, height: HERO_ICON_SIZE * scale }}
            />
            {mockHeroCourse.transportLabel}
          </span>
        </div>
      </div>

      <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
        <SectionHeader
          title="인기 추천 코스"
          actionText="자세히 보기"
          onActionClick={() => navigate('/admin/courses/popular')}
        />
        <div
          className="flex [scrollbar-width:none] overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ marginTop: LIST_MARGIN_TOP * scale, gap: LIST_GAP * scale }}
        >
          {mockPopularCourseCards.map((course) => (
            <EditableContentCard
              key={course.id}
              image={course.image}
              title={course.title}
              firstInfo={course.firstInfo}
              secondInfo={course.secondInfo}
              tags={course.tags}
              onClick={() => navigate(`/admin/courses/detail/${course.id}`)}
              onDelete={() => handleDeleteCourse(course.id)}
            />
          ))}
        </div>
      </section>

      <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
        <SectionHeader
          title="최근 본 코스"
          actionText="전체 보기"
          onActionClick={() => navigate('/admin/courses/recent')}
        />
        <div
          className="grid grid-cols-1"
          style={{ marginTop: LIST_MARGIN_TOP * scale, gap: LIST_GAP * scale }}
        >
          {mockRecentCourseCards.map((course) => (
            <EditableCourseCard
              key={course.id}
              image={course.image}
              title={course.title}
              duration={course.duration}
              courseType={course.courseType}
              companion={course.companion}
              tags={course.tags}
              onClick={() => navigate(`/admin/courses/detail/${course.id}`)}
              onDelete={() => handleDeleteCourse(course.id)}
            />
          ))}
        </div>
      </section>

      <FloatingActionButton
        ariaLabel="여기도 추천 코스 등록"
        onClick={handleStartRegistration}
      />
    </section>
  );
}

export default AdminCoursesPage;
