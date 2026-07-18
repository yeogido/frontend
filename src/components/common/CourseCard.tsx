import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import calendar from '../../assets/icons/calendar.svg';
import heart from '../../assets/icons/heart.svg';
import location from '../../assets/icons/location.svg';
import oheart from '../../assets/icons/oheart.svg';
import people from '../../assets/icons/people.svg';

import TagChip, {
  type TagType,
} from './TagChip';

export interface CourseCardProps {
  image: string;
  title: string;
  duration: string;
  courseType: string;
  companion: string;
  tags: TagType[];
  liked?: boolean;
  onClick?: () => void;
  onLikeClick?: () => void;
}

function useVisibleItemCount(itemsKey: string, itemCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);

  const [widths, setWidths] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [gap, setGap] = useState(0);

  useLayoutEffect(() => {
    const hidden = hiddenRef.current;

    if (!hidden || itemCount === 0) {
      return;
    }

    const elements = Array.from(hidden.children) as HTMLElement[];
    const nextWidths = new Array(elements.length).fill(0);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const index = elements.indexOf(entry.target as HTMLElement);

        if (index !== -1) {
          nextWidths[index] = entry.contentRect.width;
        }
      }

      setWidths([...nextWidths]);
    });

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [itemsKey, itemCount]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const update = () => {
      setContainerWidth(container.clientWidth);

      const style = getComputedStyle(container);
      const parsedGap = Number.parseFloat(
        style.columnGap || style.gap || '0',
      );

      setGap(Number.isNaN(parsedGap) ? 0 : parsedGap);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const visibleCount = useMemo(() => {
    if (itemCount === 0) {
      return 0;
    }

    const allMeasured =
      widths.length === itemCount && widths.every((w) => w > 0);

    if (!allMeasured) {
      return 0;
    }

    let totalWidth = 0;
    let count = 0;

    for (let i = 0; i < widths.length; i++) {
      const width = widths[i];
      const nextTotal = count === 0 ? width : totalWidth + gap + width;

      if (nextTotal > containerWidth) {
        break;
      }

      totalWidth = nextTotal;
      count++;
    }

    return count;
  }, [itemCount, widths, containerWidth, gap]);

  return { containerRef, hiddenRef, visibleCount };
}

function CourseCard({
  image,
  title,
  duration,
  courseType,
  companion,
  tags,
  liked = false,
  onClick,
  onLikeClick,
}: CourseCardProps) {
  const metaItems = [
    { key: 'duration', icon: calendar, label: duration },
    { key: 'courseType', icon: location, label: courseType },
    { key: 'companion', icon: people, label: companion },
  ];

  const metaKey = metaItems.map((item) => item.label).join('|');
  const tagsKey = tags.join('|');

  const {
    containerRef: metaContainerRef,
    hiddenRef: hiddenMetaRef,
    visibleCount: visibleMetaCount,
  } = useVisibleItemCount(metaKey, metaItems.length);

  const {
    containerRef: tagContainerRef,
    hiddenRef: hiddenTagRef,
    visibleCount: visibleTagCount,
  } = useVisibleItemCount(tagsKey, tags.length);

  return (
    <article
      onClick={onClick}
      className="
        relative
        flex
        min-h-[100px]
        w-full
        overflow-hidden
        rounded-xl
        bg-[#F9F9F9]
        shadow-[0_1px_5px_rgba(0,0,0,0.07)]
        cursor-pointer
      "
    >
      {/* Image: 고정 폭, 높이는 카드 실제 높이에 맞춰 자동 stretch */}
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-[136px] shrink-0 self-stretch rounded-[8px] object-cover"
        />
      ) : (
        <div className="w-[136px] shrink-0 self-stretch rounded-[8px] bg-[#EAEAEA]" />
      )}

      {/* Text column: 하트 폭과 무관하게 카드 오른쪽 끝(px-4)까지 꽉 찬다 */}
      <div className="relative flex min-w-0 flex-1 flex-col px-4 py-4">
        {/* Title: 하트 자리만 별도로 피한다 */}
        <h3 className="truncate pr-7 text-[16px] font-medium leading-none text-[#1C1C1C]">
          {title}
        </h3>

        {/* Meta: 측정 전용 hidden 영역 */}
        <div
          ref={hiddenMetaRef}
          className="absolute invisible flex gap-2"
          aria-hidden="true"
        >
          {metaItems.map((item) => (
            <div
              key={`measure-${item.key}`}
              className="flex items-center gap-[2px]"
            >
              <img
                src={item.icon}
                alt=""
                aria-hidden="true"
                className="h-[14px] w-[14px] shrink-0"
              />

              <span className="whitespace-nowrap text-[12px] font-medium leading-none text-[#7F7F7F]">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Meta: 실제로 보여지는 부분 (하트와 무관하게 카드 끝까지 사용) */}
        <div
          ref={metaContainerRef}
          className="mt-2 flex flex-nowrap items-center gap-2 overflow-hidden"
        >
          {metaItems.slice(0, visibleMetaCount).map((item) => (
            <div
              key={item.key}
              className="flex shrink-0 items-center gap-[2px]"
            >
              <img
                src={item.icon}
                alt=""
                aria-hidden="true"
                className="h-[14px] w-[14px] shrink-0"
              />

              <span className="whitespace-nowrap text-[12px] font-medium leading-none text-[#7F7F7F]">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tags: 측정 전용 hidden 영역 */}
        <div
          ref={hiddenTagRef}
          className="absolute invisible flex gap-2"
          aria-hidden="true"
        >
          {tags.map((tag, index) => (
            <TagChip key={`measure-${tag}-${index}`} type={tag} />
          ))}
        </div>

        {/* Tags: 실제로 보여지는 태그 (하트와 무관하게 카드 끝까지 사용) */}
        <div
          ref={tagContainerRef}
          className="mt-3 flex flex-nowrap items-center gap-2 overflow-hidden"
        >
          {tags.slice(0, visibleTagCount).map((tag, index) => (
            <TagChip key={`${tag}-${index}`} type={tag} />
          ))}
        </div>
      </div>

      {/* Like: 다시 absolute로, flex 폭 계산에서 완전히 제외 */}
      <button
        type="button"
        aria-pressed={liked}
        onClick={(e) => {
          e.stopPropagation();
          onLikeClick?.();
        }}
        className="absolute right-3 top-3"
      >
        <img
          src={liked ? oheart : heart}
          alt="좋아요"
          className="h-5 w-5"
        />
      </button>
    </article>
  );
}

export default CourseCard;