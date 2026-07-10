import { useNavigate } from 'react-router-dom';
import { IoSearch } from 'react-icons/io5';

import {
  ContentCard,
  CourseCard,
  SectionHeader,
} from '../../components/common';

import courseMapImage from './search/assets/courseimage.svg';

const popularCourses = [
  {
    id: 1,
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    courseName: '뚜벅이 코스',
  },
  {
    id: 2,
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    courseName: '뚜벅이 코스',
  },
];

const recentCourses = Array.from({ length: 3 }, (_, index) => ({
  id: index + 1,
  image: courseMapImage,
  title: '강릉 혼자 여행 코스',
  description: '바다를 따라 걷고, 감성 가득한 코스를 둘러보세요.',
  duration: '2박 3일',
  courseType: '뚜벅이 코스',
  liked: index === 0,
}));

function YeogidoCoursePage() {
  const navigate = useNavigate();

  const goToCourseSearch = () => {
    navigate('/yeogido-course/search');
  };

  const goToPopularCourses = () => {
    navigate('/yeogido-course/popular');
  };

  return (
    <section className="mx-6 mt-4 min-h-screen pb-10">
      <div>
        <h1 className="text-[18px] font-semibold leading-none text-[#1C1C1C]">
          여기도 왔어요
        </h1>
        <p className="mt-2 text-[12px] font-normal leading-none text-[#7F7F7F]">
          새로운 여행지를 발견해 보세요
        </p>
      </div>

      <button
        type="button"
        onClick={goToCourseSearch}
        className="mt-4 flex h-[50px] w-full items-center gap-3 rounded-[12px] border border-[#E2E2E2] bg-white px-4 text-left text-[#8D8D8D]"
      >
        <IoSearch aria-hidden="true" className="text-[24px]" />
        <span className="min-w-0 flex-1 text-[13px] font-medium leading-none">
          코스명 또는 지역명을 검색해 주세요
        </span>
      </button>

      <button
        type="button"
        onClick={goToCourseSearch}
        className="mt-4 block w-full overflow-hidden rounded-xl text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
      >
        <div className="relative h-[150px] bg-[linear-gradient(180deg,#8EA98C_0%,#507047_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.45),rgba(0,0,0,0.05))]" />
          <div className="absolute left-4 top-4 text-white">
            <p className="text-[15px] font-semibold leading-none">
              8일의 순천 힐링 여행
            </p>
            <p className="mt-2 text-[10px] font-normal leading-[14px] text-white/85">
              자연과 사람, 문화가 함께하는
              <br />
              순천만의 따뜻한 코스를 만나보세요
            </p>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-3 text-[11px] font-medium text-white">
            <span>2박 3일</span>
            <span>뚜벅이 코스</span>
          </div>
        </div>
      </button>

      <section className="mt-8">
        <SectionHeader
          title="인기 추천 코스"
          actionText="자세히 보기"
          onActionClick={goToPopularCourses}
        />

        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(163px,1fr))] gap-4">
          {popularCourses.map((course) => (
            <ContentCard
              key={course.id}
              image={courseMapImage}
              title={course.title}
              firstInfo={course.duration}
              secondInfo={course.courseName}
              className="w-full"
              imageClassName="aspect-[174/115] h-auto"
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader
          title="최근 본 코스"
          actionText="전체 보기"
          onActionClick={goToCourseSearch}
        />

        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(342px,1fr))] gap-4">
          {recentCourses.map((course) => (
            <div key={course.id} className="w-[342px] max-w-full">
              <CourseCard
                {...course}
                onClick={goToCourseSearch}
              />
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default YeogidoCoursePage;
