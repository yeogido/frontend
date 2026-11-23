import { useEffect, useState } from 'react';
import { MdCalendarToday, MdLocationOn, MdPerson } from 'react-icons/md';

import heart from '../../../assets/icons/heart.svg';
import oheart from '../../../assets/icons/oheart.svg';
import {
  ROTATE_INTERVAL_MS,
  SLIDE_DURATION_MS,
  SLIDE_EASING,
} from '../constants/carousel';
import { usePersistedIndex } from './usePersistedIndex';

// Figma 1440 데스크톱 시안(6115:16019 carousel_featured_course) 기준 리터럴 px.
// 가운데 카드가 가장 크고, 양옆으로 갈수록 작아지며 가운데 카드 뒤로 겹친다.
const CAROUSEL_HEIGHT = 476;
// 화면 밖 슬롯(±3)은 보이지 않는 대기 자리다. 카드가 이 자리로 빠져나가고, 반대편
// 대기 자리에서 들어와서 끝에서 끝으로 순간이동하지 않고 이어서 미끄러진다.
const SLOTS = [
  { offset: -3, left: -330, width: 500, height: 380, top: 48, zIndex: 5 },
  { offset: -2, left: -164, width: 564, height: 410, top: 33, zIndex: 10 },
  { offset: -1, left: 0, width: 610, height: 444, top: 16, zIndex: 20 },
  { offset: 0, left: 197, width: 654, height: 476, top: 0, zIndex: 30 },
  { offset: 1, left: 438, width: 610, height: 444, top: 16, zIndex: 20 },
  { offset: 2, left: 648, width: 564, height: 410, top: 33, zIndex: 10 },
  { offset: 3, left: 770, width: 500, height: 380, top: 48, zIndex: 5 },
] as const;
const MAX_VISIBLE_OFFSET = 2;

export interface FeaturedCourse {
  readonly id: number;
  readonly image: string | null;
  readonly title: string;
  readonly duration: string;
  readonly courseType: string;
  readonly companion: string;
  readonly liked: boolean;
}

interface FeaturedCourseCarouselProps {
  readonly courses: readonly FeaturedCourse[];
  readonly onOpen: (courseId: number) => void;
  readonly onLikeClick: (courseId: number) => void;
}

function InfoText({
  icon: Icon,
  text,
}: {
  readonly icon: typeof MdPerson;
  readonly text: string;
}) {
  if (!text) return null;

  return (
    <span className="flex items-center gap-[2px]">
      <Icon aria-hidden="true" className="text-[16px]" />
      {text}
    </span>
  );
}

/**
 * 추천 코스 캐러셀 — 옆 카드를 누르면 그 카드가 가운데로 오고,
 * 가운데 카드를 누르면 코스 상세로 간다.
 */
function FeaturedCourseCarousel({
  courses,
  onOpen,
  onLikeClick,
}: FeaturedCourseCarouselProps) {
  const count = courses.length;
  const [savedIndex, setSavedIndex] = usePersistedIndex(
    'home-featured-index',
    count
  );
  // 계속 늘어나는 위치. 카드 인덱스는 이 값을 count로 나눈 나머지라, 끝에서 끝으로
  // 넘어가는 카드도 "한 칸 더 옆으로" 가는 것으로 계산돼 이어서 미끄러진다.
  const [position, setPosition] = useState(savedIndex);
  const [isPaused, setIsPaused] = useState(false);

  const mod = (value: number) => ((value % count) + count) % count;

  const move = (delta: number) => {
    const next = position + delta;

    setPosition(next);
    setSavedIndex(mod(next));
  };

  useEffect(() => {
    if (isPaused || count <= 1) return;

    const timer = window.setInterval(() => {
      const next = position + 1;

      setPosition(next);
      setSavedIndex(((next % count) + count) % count);
    }, ROTATE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, count, position, setSavedIndex]);

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="추천 코스"
      style={{ height: CAROUSEL_HEIGHT }}
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {SLOTS.map((slot) => {
        const virtualIndex = position + slot.offset;
        const course = courses[mod(virtualIndex)];
        const isActive = slot.offset === 0;
        // 같은 코스가 양쪽에 겹쳐 보이지 않을 만큼 카드가 모자라면 그 자리는 숨긴다.
        const isVisible =
          Math.abs(slot.offset) <= MAX_VISIBLE_OFFSET &&
          count > Math.abs(slot.offset) * 2;

        return (
          <article
            key={virtualIndex}
            aria-hidden={!isVisible}
            style={{
              left: slot.left,
              top: slot.top,
              width: slot.width,
              height: slot.height,
              zIndex: slot.zIndex,
              opacity: isVisible ? 1 : 0,
              pointerEvents: isVisible ? undefined : 'none',
              transition: `all ${SLIDE_DURATION_MS}ms ${SLIDE_EASING}`,
            }}
            className="bg-gray-2 absolute overflow-hidden rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
          >
            <button
              type="button"
              tabIndex={isVisible ? 0 : -1}
              aria-label={
                isActive ? `${course.title} 코스 보기` : `${course.title} 선택`
              }
              onClick={() => (isActive ? onOpen(course.id) : move(slot.offset))}
              className="absolute inset-0 block text-left"
            >
              {course.image ? (
                <img
                  src={course.image}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              ) : null}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/70 to-transparent"
              />
              <span className="absolute bottom-[32px] left-[34px] flex flex-col gap-[12px] text-white">
                <span
                  className={`font-semibold ${
                    isActive ? 'text-[28px]' : 'text-[24px]'
                  }`}
                >
                  {course.title}
                </span>
                <span className="flex items-center gap-[8px] text-[16px] font-medium">
                  <InfoText icon={MdCalendarToday} text={course.duration} />
                  <InfoText icon={MdLocationOn} text={course.courseType} />
                  <InfoText icon={MdPerson} text={course.companion} />
                </span>
              </span>
            </button>

            <button
              type="button"
              aria-label={
                course.liked
                  ? `${course.title} 좋아요 취소`
                  : `${course.title} 좋아요`
              }
              aria-pressed={course.liked}
              tabIndex={isVisible ? 0 : -1}
              onClick={() => onLikeClick(course.id)}
              className="absolute top-[22px] right-[26px]"
            >
              <img
                src={course.liked ? oheart : heart}
                alt=""
                draggable={false}
                className="h-[28px] w-[28px]"
              />
            </button>
          </article>
        );
      })}
    </div>
  );
}

export default FeaturedCourseCarousel;
