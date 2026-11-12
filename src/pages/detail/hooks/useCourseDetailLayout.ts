import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useEditCourse } from '../../../hooks/useEditCourse';
import { useEditLocalCourse } from '../../../hooks/useEditLocalCourse';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useIsAdmin } from '../../../hooks/useMyProfile';
import {
  useCourseReviewPreviews,
  useReviewDelete,
  useReviewDetailModal,
  useReviewEdit,
} from '../../../hooks/useReviews';
import { useAuthStore } from '../../../store/auth.store';
import { getCourseReviewsPath } from '../../../utils/courseReviewRoute';
import { readOpenedReview } from '../../../utils/reviewNavigation';
import { mapCourseReviewPreviews } from '../mappers/courseReviewMapper';
import type { CourseStop } from '../types/courseDetail';
import type { CourseDetailLayoutProps } from '../types/courseDetailLayout';
import { useShareToast } from './useShareToast';

/** 미리보기에 그리는 후기 수. */
const COURSE_REVIEW_PREVIEW_COUNT = 4;

/**
 * 코스 상세 화면의 상태와 이동. 모바일과 데스크톱 레이아웃이 생김새만
 * 다르고 좋아요, 후기 모달, 공유, 수정 흐름은 같아서 여기 한 곳에 둔다.
 */
export function useCourseDetailLayout({
  course,
  reviewType,
  onFavoriteToggle,
  isFavoritePending = false,
  onPlaceLikeToggle,
  onContentLikeToggle,
  pendingPlaceIds = new Set<number>(),
  pendingContentIds = new Set<number>(),
}: CourseDetailLayoutProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { openLoginModal } = useLoginModal();
  const numericCourseId = Number(course.id);
  const isAdmin = useIsAdmin();
  // 소유권/관리자 판단은 API의 canManage 값을 그대로 따른다 - 서버가
  // local-course는 작성자 여부로, yeogido-course는 관리자 권한으로 이미
  // 판단해 내려준다. 다만 local-course는 어드민도 남의 글의 canManage가
  // true로 내려오므로, 어드민에게는 수정 대신 기존 좋아요 표시를 유지한다.
  const canEdit =
    isAuthenticated &&
    course.canManage &&
    !(reviewType === 'local-course' && isAdmin);
  const { editLocalCourse } = useEditLocalCourse();
  const { editCourse } = useEditCourse();
  const { data: courseReviews } = useCourseReviewPreviews(
    Number.isInteger(numericCourseId) ? numericCourseId : undefined
  );
  // 사진 유무와 관계없이 최신 후기를 미리보기로 노출한다.
  const reviews = mapCourseReviewPreviews(courseReviews?.items).slice(
    0,
    COURSE_REVIEW_PREVIEW_COUNT
  );
  const { requestDelete, dialogProps } = useReviewDelete();
  const { requestEdit, editorProps } = useReviewEdit();
  const { openedReview, openReview, closeReview } =
    useReviewDetailModal(reviews);
  /*
   * 후기 목록 화면에서 카드를 눌러 넘어온 경우, 그 후기를 그대로 띄운다.
   *
   * state로 따로 들지 않고 매 렌더 읽는다. 같은 코스의 다른 후기를 연달아
   * 누르면 이 컴포넌트가 다시 마운트되지 않아(경로가 같고 코스 데이터도
   * 캐시에 있다) 초기값으로 한 번만 읽으면 두 번째부터는 안 열린다.
   */
  const location = useLocation();
  const incomingReview = readOpenedReview(location.state);

  const closeReviewDetail = () => {
    closeReview();

    if (!incomingReview) return;

    // state를 비우면 다음 렌더에서 모달이 닫힌다. 남겨 두면 다른 화면에
    // 갔다가 뒤로가기로 돌아왔을 때 다시 열린다.
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    });
  };

  const [isLiked, setIsLiked] = useState(course.liked);
  const [stops, setStops] = useState<readonly CourseStop[]>(course.stops);
  const [focusedStopId, setFocusedStopId] = useState<number | null>(null);
  const { copied, isToastVisible, handleShare } = useShareToast();

  const handleStopLikeToggle = (stopId: number) => {
    if (!isAuthenticated || !accessToken) {
      openLoginModal();
      return;
    }

    const stop = stops.find((item) => item.id === stopId);

    if (
      !stop ||
      (stop.placeId !== undefined && pendingPlaceIds.has(stop.placeId)) ||
      (stop.contentId !== undefined && pendingContentIds.has(stop.contentId))
    ) {
      return;
    }

    if (stop.placeId !== undefined && onPlaceLikeToggle) {
      void onPlaceLikeToggle(stop.placeId, stop.liked, stop.id)
        .then((isLiked) => {
          setStops((prevStops) =>
            prevStops.map((item) =>
              item.id === stopId ? { ...item, liked: isLiked } : item
            )
          );
        })
        .catch(() => undefined);
      return;
    }

    if (stop.contentId !== undefined && onContentLikeToggle) {
      void onContentLikeToggle(stop.contentId, stop.liked)
        .then((isLiked) => {
          setStops((prevStops) =>
            prevStops.map((item) =>
              item.id === stopId ? { ...item, liked: isLiked } : item
            )
          );
        })
        .catch(() => undefined);
      return;
    }

    setStops((prevStops) =>
      prevStops.map((item) =>
        item.id === stopId ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const handleFavoriteToggle = () => {
    if (isFavoritePending) {
      return;
    }

    if (!isAuthenticated || !accessToken) {
      openLoginModal();
      return;
    }

    if (onFavoriteToggle) {
      void onFavoriteToggle(isLiked)
        .then(setIsLiked)
        .catch(() => undefined);
      return;
    }

    setIsLiked((previous) => !previous);
  };

  const handleNavigateReview = () => {
    if (!isAuthenticated || !accessToken) {
      openLoginModal();
      return;
    }

    navigate(`/review?type=${reviewType}&id=${course.id}`);
  };

  const handleNavigateCourseReviews = () => {
    // 후기 목록은 전체보기 화면이 직접 조회한다. 제목만 넘겨서 헤더 문구가
    // 조회를 기다리지 않고 바로 나오게 한다.
    navigate(getCourseReviewsPath(reviewType, course.id), {
      state: { courseTitle: course.title },
    });
  };

  const handleEdit = () =>
    void (reviewType === 'local-course'
      ? editLocalCourse(numericCourseId)
      : editCourse(numericCourseId));

  return {
    numericCourseId,
    canEdit,
    handleEdit,
    isLiked,
    handleFavoriteToggle,
    isFavoritePending,
    stops,
    focusedStopId,
    setFocusedStopId,
    handleStopLikeToggle,
    pendingPlaceIds,
    pendingContentIds,
    reviews,
    requestReviewDelete: requestDelete,
    requestReviewEdit: requestEdit,
    reviewDeleteDialogProps: dialogProps,
    reviewEditorProps: editorProps,
    openReview,
    openedReview,
    incomingReview,
    closeReviewDetail,
    share: { copied, isToastVisible, handleShare },
    handleNavigateReview,
    handleNavigateCourseReviews,
  };
}
