import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  CourseCard,
  SearchTriggerButton,
  SectionHeader,
} from '../../components/common';

import calendar from '../../assets/icons/calendar.svg';
import location from '../../assets/icons/location.svg';
import courseMapImage from './assets/courseimage.svg';
import {
  yeogidoCoursePopularPreviews,
  yeogidoCourseRecentPreviews,
} from './constants/coursePreviews';

const COURSE_REGION_SEARCH_PATH = '/course-region-search';
const COURSE_REGION_SEARCH_FROM_COURSE = '?from=course';

function YeogidoCoursePage() {
  const navigate = useNavigate();

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
    <section className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-6 pt-3 pb-10">
      <div>
        <h1 className="text-[18px] leading-[22px] font-semibold text-black">
          여기도 왔어요
        </h1>
        <p className="text-gray-4 mt-[6px] text-[12px] leading-[17px] font-normal">
          새로운 여행지를 발견해 보세요
        </p>
      </div>

      <SearchTriggerButton
        className="mt-[11px]"
        label="코스명 또는 지역명 검색 화면으로 이동"
        placeholder="코스명 또는 지역명을 검색해 주세요"
        onClick={goToCourseRegionSearch}
      />

      <button
        type="button"
        onClick={goToCourseRegionSearch}
        className="mt-3 block w-full overflow-hidden rounded-xl text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
      >
        <div className="relative h-[129px] overflow-hidden bg-[linear-gradient(180deg,#8EA98C_0%,#507047_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.45),rgba(0,0,0,0.05))]" />
          <div className="text-pure-white absolute top-6 left-4 w-[163px]">
            <p className="text-[15px] leading-[19px] font-semibold">
              8월의 순천 힐링 여행
            </p>
            <p className="text-pure-white/85 mt-2.5 text-[10px] leading-3 font-normal">
              자연과 사람, 로컬 문화를 천천히 경험하며 순천만의 매력을
              느껴보세요.
            </p>
          </div>
          <div className="text-pure-white absolute bottom-3.5 left-4 flex items-center gap-2.5 text-[10px] leading-3 font-medium">
            <span className="flex items-center gap-0.5">
              <img
                src={calendar}
                alt=""
                aria-hidden="true"
                className="h-3.5 w-3.5 brightness-0 invert"
              />
              2박 3일
            </span>
            <span className="flex items-center gap-0.5">
              <img
                src={location}
                alt=""
                aria-hidden="true"
                className="h-3.5 w-3.5 brightness-0 invert"
              />
              뚜벅이 코스
            </span>
          </div>
        </div>
      </button>

      <section className="mt-8">
        <SectionHeader
          title="인기 추천 코스"
          actionText="자세히 보기"
          onActionClick={goToPopularCourses}
        />

        <div className="mt-3 flex [scrollbar-width:none] gap-4 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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

      <section className="mt-8">
        <SectionHeader
          title="최근 본 코스"
          actionText="전체 보기"
          onActionClick={goToRecentCourses}
        />

        <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(342px,1fr))] gap-4">
          {yeogidoCourseRecentPreviews.map((course) => (
            <div key={course.id} className="w-[342px] max-w-full">
              <CourseCard {...course} onClick={goToCourseRegionSearch} />
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default YeogidoCoursePage;
