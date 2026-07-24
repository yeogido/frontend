import { useEffect, useRef, useState } from 'react';

import {
  ReviewCard,
  ReviewCardSkeleton,
  SectionHeader,
} from '../../../components/common';
import { useNavigate } from 'react-router-dom';

import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const SECTION_MARGIN_TOP = 32;
const SECTION_GAP = 12;
const SECTION_PADDING_X = 24;

const DOT_GAP = 4;
const DOT_SIZE = 4;
const DOT_ACTIVE_WIDTH = 20;
const DOT_RADIUS = 100;

const reviews = [
  {
    id: 1,
    images: ['', ''],
    profileImage: '',
    nickname: '민지',
    meta: '20대 여',
    content:
      '혼자 떠난 강릉 여행이었는데 바다도 예쁘고 코스도 알차서 정말 만족스러웠어요.',
    rating: 5,
  },
  {
    id: 2,
    images: [''],
    profileImage: '',
    nickname: '준호',
    meta: '30대 남',
    content:
      '맛집과 카페 동선이 잘 짜여 있어서 하루 동안 편하게 여행했습니다.',
    rating: 5,
  },
  {
    id: 3,
    images: ['', '', ''],
    profileImage: '',
    nickname: '수진',
    meta: '20대 여',
    content:
      '사진 찍기 좋은 장소가 많고 코스가 자연스럽게 이어져서 즐거운 여행이었어요.',
    rating: 5,
  },
];

function ReviewSection() {
  const isLoading = false;
  // const isLoading = true; 스켈레톤 확인용

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

        const index = Math.round(container.scrollLeft / itemWidth);
        setActiveIndex(index);
      });
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

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
        onActionClick={() => navigate('/review')}
      />

      {/* Carousel: 카드 1개가 화면을 꽉 채우며 스와이프로 다음 카드로 스냅 이동 */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
      >
        {isLoading
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
                  profileImage={review.profileImage}
                  nickname={review.nickname}
                  meta={review.meta}
                  content={review.content}
                  rating={review.rating}
                />
              </div>
            ))}
      </div>

      {/* Pagination dots */}
      {!isLoading && reviews.length > 1 && (
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
    </section>
  );
}

export default ReviewSection;