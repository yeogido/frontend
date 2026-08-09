import { useNavigate } from 'react-router-dom';

import {
  ContentCardSkeleton,
  EditableContentCard,
} from '../../../../components/common';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { usePopularCourses } from '../../../../hooks/useCourses';
import { useEditCourse } from '../../../../hooks/useEditCourse';
import { toContentTagIds } from '../../../../utils/contentTags';
import { toDurationLabel } from '../../../../utils/courseEnumLabels';
import { buildCourseDetailPath } from '../../../../utils/routes';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;
const LIST_MARGIN_TOP = 24;
const LIST_GAP = 16;
const ERROR_MARGIN_TOP = 24;
const ERROR_TEXT_SIZE = 13;
const SKELETON_ITEMS = [0, 1, 2, 3];

function AdminCoursesPopularPage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();

  const {
    data: popularCourses,
    isPending,
    isError,
    refetch,
  } = usePopularCourses({ courseType: 'OFFICIAL' });
  const { editCourse } = useEditCourse();

  const goToCourseDetail = (courseId: number) => {
    navigate(buildCourseDetailPath('OFFICIAL', courseId));
  };

  const handleDeleteCourse = (courseId: number) => {
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
          인기 추천 코스
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          여행자들이 가장 많이 찾는 추천 코스
        </p>
      </div>

      <div
        className="grid grid-cols-2"
        style={{
          marginTop: LIST_MARGIN_TOP * scale,
          columnGap: LIST_GAP * scale,
          rowGap: LIST_GAP * scale,
        }}
      >
        {isPending
          ? SKELETON_ITEMS.map((item) => (
              <ContentCardSkeleton
                key={item}
                className="w-full"
                imageClassName="aspect-[163/115] h-auto"
              />
            ))
          : (popularCourses ?? []).map((course) => (
              <EditableContentCard
                key={course.courseId}
                image={course.thumbnailUrl}
                title={course.title}
                firstInfo={toDurationLabel(course.durationType)}
                secondInfo={course.region}
                tags={toContentTagIds(course.tags)}
                className="w-full"
                onClick={() => goToCourseDetail(course.courseId)}
                onEdit={() => void editCourse(course.courseId)}
                onDelete={() => handleDeleteCourse(course.courseId)}
              />
            ))}
      </div>

      {!isPending && isError ? (
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
            onClick={() => void refetch()}
            className="rounded-full border border-[#e4e4e4] px-4 py-2 text-[14px] font-medium text-[#505050]"
          >
            다시 시도
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default AdminCoursesPopularPage;
