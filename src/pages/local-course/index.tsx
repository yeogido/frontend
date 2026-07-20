import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  CourseCard,
  SearchTriggerButton,
  SectionHeader,
} from '../../components/common';

import {
  CreateCourseBanner,
  FloatingCreateButton,
} from './components';
import useLocalCoursePreviews from './hooks/useLocalCoursePreviews';

function LocalCoursePage() {
  const navigate = useNavigate();
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
    <section className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-6 pt-3 pb-10">
      <div>
        <h1 className="text-[18px] leading-[22px] font-semibold text-black">
          우리동네 추천 코스
        </h1>
        <p className="text-gray-4 mt-[5px] text-[12px] leading-[17px] font-normal">
          여행자들이 직접 만든 지역 경험 코스
        </p>
      </div>

      <SearchTriggerButton
        className="mt-3"
        label="지역명 또는 도시명 검색 화면으로 이동"
        placeholder="지역명 또는 도시명을 검색해 주세요"
        onClick={goToRegionSearch}
      />

      <div className="mt-3">
        <CreateCourseBanner onClick={goToCreateCourse} />
      </div>

      <section className="mt-8">
        <SectionHeader
          title="인기 추천 코스"
          actionText="자세히 보기"
          onActionClick={goToPopularCourses}
        />

        <div className="mt-3 flex [scrollbar-width:none] gap-4 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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

      <section className="mt-8">
        <SectionHeader
          title="최근 본 코스"
          actionText="전체 보기"
          onActionClick={goToRecentCourses}
        />

        <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(342px,1fr))] gap-4">
          {recentCourses.map((course) => (
            <div key={course.id} className="w-[342px] max-w-full">
              <CourseCard {...course} />
            </div>
          ))}
        </div>
      </section>

      <FloatingCreateButton onClick={goToCreateCourse} />
    </section>
  );
}

export default LocalCoursePage;
