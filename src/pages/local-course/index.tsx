import { useNavigate } from 'react-router-dom';

import {
  CourseDeleteDialog,
  FloatingActionButton,
  SearchTriggerButton,
} from '../../components/common';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useLoginModal } from '../../hooks/useLoginModal';
import { useAuthStore } from '../../store/auth.store';
import {
  useCourseDelete,
  usePopularLocalCourses,
} from '../../hooks/useCourses';
import { useCourseLikeToggle } from '../../hooks/useCourseLikeToggle';
import { useLocalRecommendationStore } from '../../store/localRecommendation.store';
import { toContentTagIds } from '../../utils/contentTags';
import {
  toCompanionLabel,
  toDurationLabel,
} from '../../utils/courseEnumLabels';

import {
  LocalCourseHero,
  PopularCourseCard,
  PopularCourseCardSkeleton,
} from './components';
import LocalCourseList from './components/LocalCourseList';

const PAGE_PADDING_X = 24;
// Figma 검색바 시작점(y=246)에 맞춰 277px 히어로와 31px 겹친다.
const PAGE_PADDING_TOP = -31;
const PAGE_PADDING_BOTTOM = 40;
// 검색바 끝 → 필터 줄 (Figma 모바일 시안: 47 → 59)
const FILTER_MARGIN_TOP = 12;

/** createdAt("2026-07-26T15:30:00" 등)을 "2026.07.26"로 바꾼다. */
function formatCourseCreatedAt(createdAt: string): string {
  return createdAt.slice(0, 10).replace(/-/g, '.');
}

function LocalCoursePage() {
  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();
  const { getLiked, toggleLike } = useCourseLikeToggle();
  const { requestDelete, dialogProps } = useCourseDelete();

  const { data: popularCourses, isPending: isPopularCoursesPending } =
    usePopularLocalCourses();
  // 시안은 필터 줄 아래에 가장 인기 있는 코스 한 장만 크게 보여준다.
  const featuredCourse = popularCourses?.[0];

  const goToRegionSearch = () => {
    navigate('/course-region-search?from=local-course');
  };

  const handleCreateCourse = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    useLocalRecommendationStore.getState().resetDraft();
    navigate('/local-recommendation');
  };

  const featured = isPopularCoursesPending ? (
    <PopularCourseCardSkeleton />
  ) : featuredCourse ? (
    <PopularCourseCard
      authorAvatarUrl={featuredCourse.author.profileImageUrl}
      authorName={featuredCourse.author.nickname}
      date={formatCourseCreatedAt(featuredCourse.createdAt)}
      image={
        featuredCourse.routeImageUrl?.trim() || featuredCourse.thumbnailUrl
      }
      title={featuredCourse.title}
      duration={toDurationLabel(featuredCourse.durationType)}
      companion={toCompanionLabel(featuredCourse.companionType)}
      tags={toContentTagIds(featuredCourse.tags)}
      liked={getLiked(featuredCourse.courseId, featuredCourse.isLiked)}
      isMine={featuredCourse.canManage}
      onClick={() =>
        navigate(`/local-course/detail/${featuredCourse.courseId}`)
      }
      onLikeClick={() =>
        toggleLike(
          featuredCourse.courseId,
          getLiked(featuredCourse.courseId, featuredCourse.isLiked)
        )
      }
      onDeleteClick={() => requestDelete(featuredCourse.courseId)}
    />
  ) : undefined;

  return (
    <>
      <LocalCourseHero onCreateClick={handleCreateCourse} />

      <section
        className="relative mx-auto flex min-h-screen w-full flex-col"
        style={{
          paddingLeft: PAGE_PADDING_X * scale,
          paddingRight: PAGE_PADDING_X * scale,
          // paddingTop은 음수를 못 받아 marginTop으로 곡선 아래쪽에 겹치게
          // 끌어올린다(padding은 CSS 스펙상 음수가 무시되고 0으로 clamp됨).
          marginTop: PAGE_PADDING_TOP * scale,
          paddingBottom: PAGE_PADDING_BOTTOM * scale,
        }}
      >
        <SearchTriggerButton
          label="지역명 또는 도시명 검색 화면으로 이동"
          placeholder="지역명 또는 도시명을 검색해 주세요"
          onClick={goToRegionSearch}
        />

        <LocalCourseList
          filterMarginTop={FILTER_MARGIN_TOP}
          featured={featured}
        />

        <FloatingActionButton
          ariaLabel="코스 만들기"
          onClick={handleCreateCourse}
        />
      </section>
      <CourseDeleteDialog {...dialogProps} />
    </>
  );
}

export default LocalCoursePage;
