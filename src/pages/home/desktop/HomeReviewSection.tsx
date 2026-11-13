import { MdFormatQuote } from 'react-icons/md';

import darkStar from '../../../assets/icons/dark star.svg';
import star from '../../../assets/icons/star.svg';
import ReviewerAvatar from '../../../components/common/ReviewerAvatar';
import { useOpenReviewInCourseDetail } from '../../../hooks/useOpenReviewInCourseDetail';
import { useRecentReviews } from '../../../hooks/useReviews';
import { toReviewCardProps } from '../../../utils/reviewCard';

// Figma 1440 데스크톱 시안(6115:36813 card_review) 기준 리터럴 px.
const REVIEW_COUNT = 8;
const CARD_WIDTH = 333;
const CARD_HEIGHT = 419;
const AVATAR_SIZE = 56;
const STAR_SIZE = 20;
const STAR_COUNT = 5;
const SKELETON_COUNT = 3;

/**
 * 최근 후기 — 분홍 띠 위에 후기 카드를 가로로 늘어놓는다. 폭을 넘치면
 * 스크롤하고, 카드를 누르면 그 후기가 달린 코스 상세로 간다.
 */
function HomeReviewSection() {
  const { data, isPending, isError } = useRecentReviews();
  const goToCourseDetail = useOpenReviewInCourseDetail();
  const reviews = (data?.items ?? [])
    .map(toReviewCardProps)
    .slice(0, REVIEW_COUNT);

  return (
    <section aria-label="최근 후기" className="bg-main-2 py-[40px]">
      <h2 className="mx-auto w-[1048px] text-[24px] font-semibold text-black">
        최근 여행자들의 후기를 모아봤어요
      </h2>

      {isError ? (
        <p
          role="alert"
          className="text-main-5 mx-auto mt-[32px] w-[1048px] text-[16px] font-medium"
        >
          후기를 불러오지 못했어요.
        </p>
      ) : (
        <ul className="mt-[32px] flex w-full [scrollbar-width:none] gap-[24px] overflow-x-auto px-[max(24px,calc((100%-1048px)/2))] pb-[8px] [&::-webkit-scrollbar]:hidden">
          {isPending
            ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <li
                  key={index}
                  aria-hidden="true"
                  style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                  className="shrink-0 animate-pulse rounded-[24px] bg-white/60"
                />
              ))
            : reviews.map((review) => (
                <li key={review.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => goToCourseDetail(review)}
                    style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                    className="flex flex-col gap-[20px] rounded-[24px] bg-white p-[28px] text-left"
                  >
                    <span className="flex items-center gap-[12px]">
                      <ReviewerAvatar
                        src={review.profileImage}
                        size={AVATAR_SIZE}
                        isMine={review.isMine}
                      />
                      <span className="flex flex-col gap-[4px]">
                        <span className="text-[16px] font-semibold text-black">
                          {review.nickname}
                          {review.meta ? (
                            <span className="text-gray-4 font-normal">
                              {' '}
                              · {review.meta}
                            </span>
                          ) : null}
                        </span>
                        <span
                          role="img"
                          aria-label={`별점 ${review.rating}점`}
                          className="flex"
                        >
                          {Array.from({ length: STAR_COUNT }, (_, index) => (
                            <img
                              key={index}
                              src={index < review.rating ? star : darkStar}
                              alt=""
                              draggable={false}
                              style={{ width: STAR_SIZE, height: STAR_SIZE }}
                            />
                          ))}
                        </span>
                      </span>
                    </span>

                    <MdFormatQuote
                      aria-hidden="true"
                      className="text-gray-3 shrink-0 text-[32px]"
                    />

                    <span className="line-clamp-6 min-h-0 flex-1 text-[16px] leading-[1.6] break-words text-black">
                      {review.content}
                    </span>

                    <span className="border-gray-3 text-gray-4 truncate border-l-2 pl-[8px] text-[14px]">
                      {review.courseTitle}
                    </span>
                  </button>
                </li>
              ))}
        </ul>
      )}
    </section>
  );
}

export default HomeReviewSection;
