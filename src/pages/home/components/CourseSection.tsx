import { useNavigate } from 'react-router-dom';

import {
  CourseCard,
  CourseCardSkeleton,
  SectionHeader,
} from '../../../components/common';
import type { TagType } from '../../../components/common/TagChip';

import { useGlobalScale } from '../../../hooks/useGlobalScale';

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;
const CARD_GAP = 16;

function CourseSection() {
  const isLoading = false;
  // const isLoading = true; // 스켈레톤 확인용

  const navigate = useNavigate();
  const scale = useGlobalScale();

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
    <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
      <div
        style={{
          paddingLeft: SECTION_PADDING_X * scale,
          paddingRight: SECTION_PADDING_X * scale,
        }}
      >
        <SectionHeader
          title="여기도 추천 코스"
          actionText="전체보기"
          onActionClick={() => navigate('/yeogido-course/search')}
        />
      </div>

      <div
        className="flex flex-col"
        style={{
          marginTop: LIST_MARGIN_TOP * scale,
          gap: CARD_GAP * scale,
          paddingLeft: SECTION_PADDING_X * scale,
          paddingRight: SECTION_PADDING_X * scale,
        }}
      >
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