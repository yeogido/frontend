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

interface RegionCourseSectionProps {
  regionName: string;
}

function RegionCourseSection({
  regionName,
}: RegionCourseSectionProps) {
  const scale = useGlobalScale();

  const isLoading = false;
  // const isLoading = true;

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
      title: `${regionName} 인기 여행 코스`,
      duration: '2박 3일',
      courseType: '뚜벅이',
      companion: '친구',
      tags: ['summer', 'sea', 'cafe'],
      liked: false,
    },
    {
      image: '',
      title: `${regionName} 감성 여행`,
      duration: '1박 2일',
      courseType: '드라이브',
      companion: '연인',
      tags: ['nature', 'experience'],
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
          title={`${regionName}의 인기 코스`}
          actionText="전체보기"
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
          courses.map((course) => (
            <CourseCard
              key={course.title}
              {...course}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default RegionCourseSection;