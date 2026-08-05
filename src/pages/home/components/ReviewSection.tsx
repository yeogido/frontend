import { useEffect, useRef, useState } from 'react';

import {
  ReviewCard,
  ReviewCardSkeleton,
  ReviewDeleteDialog,
  ReviewDetailModal,
  SectionHeader,
} from '../../../components/common';
import { useNavigate } from 'react-router-dom';

import { useNavigateToCourseDetail } from '../../../hooks/useCourses';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import {
  useMyReviewIds,
  useRecentReviews,
  useReviewDelete,
  useReviewDetailModal,
} from '../../../hooks/useReviews';
import { toReviewCardProps } from '../../../utils/reviewCard';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 32;
const SECTION_GAP = 12;
const SECTION_PADDING_X = 24;
const REVIEW_CARD_GAP = 12;

const DOT_GAP = 4;
const DOT_SIZE = 4;
const DOT_ACTIVE_WIDTH = 20;
const DOT_RADIUS = 100;
const ERROR_TEXT_SIZE = 13;

function ReviewSection() {
  const { data, isPending, isError } = useRecentReviews();
  const myReviewIds = useMyReviewIds();
  const reviews = (data?.items ?? []).map((review) =>
    toReviewCardProps(review, myReviewIds)
  );
  const { requestDelete, dialogProps } = useReviewDelete();
  const { openedReview, openReview, closeReview } =
    useReviewDetailModal(reviews);
  const { goToCourseDetail } = useNavigateToCourseDetail();
  const navigate = useNavigate();
  const scale = useGlobalScale();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    let rafId: number;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const itemWidth = container.clientWidth;

        if (itemWidth === 0) {
          return;
        }

        const index = Math.round(
          container.scrollLeft / (itemWidth + REVIEW_CARD_GAP * scale)
        );
        setActiveIndex(index);
      });
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [scale]);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      left: (container.clientWidth + REVIEW_CARD_GAP * scale) * index,
      behavior: 'smooth',
    });
  };

  // 후기가 아직 없는 건 정상 상태라 섹션을 통째로 감춘다. 제목만 남고 캐러셀이
  // 비어 있으면 아직 로딩 중인 것처럼 보이기 때문이다. 반면 조회 실패는
  // 감추면 원인을 알 수 없으므로 안내를 남긴다.
  if (!isPending && !isError && reviews.length === 0) {
    return null;
  }

  return (
    <section
      className="flex flex-col"
      style={{
        marginTop: SECTION_MARGIN_TOP * scale,
        gap: SECTION_GAP * scale,
        paddingLeft: SECTION_PADDING_X * scale,
        paddingRight: SECTION_PADDING_X * scale,
      }}
    >
      <SectionHeader
        title="최근 여행자들의 후기"
        actionText="전체보기"
        onActionClick={() => navigate('/recent-review-courses')}
      />

      {isError && !isPending && (
        <p
          className="text-gray-4 text-center font-medium"
          style={{ fontSize: ERROR_TEXT_SIZE * scale }}
        >
          후기를 불러오지 못했습니다.
        </p>
      )}

      {/* Carousel: 카드 1개가 화면을 꽉 채우며 스와이프로 다음 카드로 스냅 이동 */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
        style={{ gap: REVIEW_CARD_GAP * scale }}
      >
        {isPending
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="w-full shrink-0 snap-start snap-always"
              >
                <ReviewCardSkeleton />
              </div>
            ))
          : reviews.map((review) => (
              <div
                key={review.id}
                className="w-full shrink-0 snap-start snap-always"
              >
                <ReviewCard
                  images={review.images}
                  courseTitle={review.courseTitle}
                  profileImage={review.profileImage}
                  nickname={review.nickname}
                  meta={review.meta}
                  content={review.content}
                  rating={review.rating}
                  isMine={review.isMine}
                  onDeleteClick={() => requestDelete(review.id)}
                  onLongPress={() => openReview(review.id)}
                />
              </div>
            ))}
      </div>

      {/* Pagination dots */}
      {!isPending && reviews.length > 1 && (
        <div
          className="flex items-center justify-center"
          style={{ gap: DOT_GAP * scale }}
        >
          {reviews.map((review, index) => (
            <button
              key={review.id}
              type="button"
              aria-label={`${index + 1}번째 후기로 이동`}
              aria-current={index === activeIndex}
              onClick={() => scrollToIndex(index)}
              className="shrink-0"
              style={{
                width:
                  (index === activeIndex ? DOT_ACTIVE_WIDTH : DOT_SIZE) *
                  scale,
                height: DOT_SIZE * scale,
                borderRadius: DOT_RADIUS,
                backgroundColor:
                  index === activeIndex ? '#FF6F41' : '#A1A1A1',
                transition: 'width 0.2s ease, background-color 0.2s ease',
              }}
            />
          ))}
        </div>
      )}

      {/*
        카드 자체에는 클릭 이동을 붙이지 않는다. 홈 후기는 좌우 스와이프로
        넘기는 캐러셀이라 탭 판정이 스와이프와 부딪친다. 코스로 가는 길은
        모달의 '코스 바로가기'로만 연다.
      */}
      <ReviewDetailModal
        review={openedReview}
        courseTitle={openedReview?.courseTitle}
        onClose={closeReview}
        onGoToCourse={
          openedReview && (() => void goToCourseDetail(openedReview.courseId))
        }
      />

      <ReviewDeleteDialog {...dialogProps} />
    </section>
  );
}

export default ReviewSection;
