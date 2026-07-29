import { useEffect, useRef, useState } from 'react';

import { ReviewCard, SectionHeader } from '../../../components/common';
import { MIN_TOUCH_TARGET } from '../../../constants/layout';
import type { CourseReview } from '../types/courseDetail';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { getCourseReviewIndex } from '../utils/courseReviewCarousel';

const SECTION_GAP = 14;

const DOT_GAP = 4;
const DOT_SIZE = 4;
const DOT_ACTIVE_WIDTH = 20;
const DOT_RADIUS = 100;

// Figma 390 디자인 기준 리터럴 px (서브3-a.svg, 등록된 리뷰 없음 상태)
const EMPTY_STATE_WIDTH = 342;
const EMPTY_STATE_HEIGHT = 249;
const EMPTY_STATE_RADIUS = 12;
const EMPTY_STATE_FONT_SIZE = 14;

export interface DetailReviewSectionProps {
  readonly reviews: readonly CourseReview[];
  readonly className?: string;
}

export function DetailReviewSection({
  reviews,
  className = '',
}: DetailReviewSectionProps) {
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
        setActiveIndex(
          getCourseReviewIndex(
            container.scrollLeft,
            container.clientWidth,
            reviews.length
          )
        );
      });
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [reviews.length]);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      left: container.clientWidth * index,
      behavior: 'smooth',
    });
  };

  return (
    <section
      className={`flex flex-col bg-white ${className}`}
      style={{
        gap: SECTION_GAP * scale,
      }}
    >
      <SectionHeader title="최근 여행자들의 후기" actionText="전체보기" />

      {reviews.length === 0 ? (
        <div
          role="status"
          className="text-gray-5 flex items-center justify-center bg-[#F1F1F1]"
          style={{
            width: EMPTY_STATE_WIDTH * scale,
            height: EMPTY_STATE_HEIGHT * scale,
            borderRadius: EMPTY_STATE_RADIUS * scale,
            fontSize: EMPTY_STATE_FONT_SIZE * scale,
          }}
        >
          등록된 리뷰가 없어요
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="w-full shrink-0 snap-start snap-always"
            >
              <ReviewCard
                images={review.images}
                profileImage={review.profileImage}
                nickname={review.nickname}
                meta={review.meta}
                content={review.content}
                rating={review.rating}
                className="[&>div>article]:!bg-background"
              />
            </div>
          ))}
        </div>
      )}

      {reviews.length > 1 && (
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
              className="flex shrink-0 items-center justify-center"
              style={{
                width: MIN_TOUCH_TARGET,
                height: MIN_TOUCH_TARGET,
              }}
            >
              <span
                aria-hidden="true"
                className="block shrink-0"
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
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export const CourseReviewSection = DetailReviewSection;
export default DetailReviewSection;
