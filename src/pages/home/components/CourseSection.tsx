import { useNavigate } from 'react-router-dom';

import {
  CourseCard,
  CourseCardSkeleton,
  SectionHeader,
} from '../../../components/common';
import type { TagType } from '../../../components/common/TagChip';

function CourseSection() {
  const isLoading = false; // UI 확인용
  // const isLoading = true; // Skeleton 확인용

  const navigate = useNavigate();

  const courses: {
    image: string;
    title: string;
    duration: string;
    courseType: string;
    companion: string;
    tags: TagType[];
    liked: boolean;
  }[] = [
    {
      image: '',
      title: '강릉 혼자 여행 코스',
      duration: '2박 3일',
      courseType: '뚜벅이',
      companion: '혼자',
      tags: ['summer', 'nature', 'sea'],
      liked: false,
    },
    {
      image: '',
      title: '서울에서 출발하는 3박 4일 여름 바다 여행 추천 코스',
      duration: '3박 4일',
      courseType: '드라이브',
      companion: '친구',
      tags: ['summer', 'sea', 'cafe'],
      liked: true,
    },
  ];

  return (
    <section className="mt-8">
      <div className="px-6">
        <SectionHeader
          title="여기도 추천 코스"
          actionText="전체보기"
          onActionClick={() => navigate('/yeogido-course')}
        />
      </div>

      <div className="mt-4 flex flex-col gap-4 px-6">
        {isLoading ? (
          <>
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </>
        ) : (
          <>
            {courses.map((course) => (
              <CourseCard
                key={course.title}
                {...course}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

export default CourseSection;