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

import TagChip, { type TagType } from './TagChip';

interface ContentCardProps {
  image: string;
  title: string;
  firstInfo: string;
  secondInfo: string;
  liked?: boolean;
  className?: string;
  imageClassName?: string;
  tags?: TagType[];
  onClick?: () => void;
  onLikeClick?: () => void;
}

function useResponsiveTagCount(tags: TagType[] | undefined) {
  const visibleContainerRef = useRef<HTMLDivElement>(null);
  const hiddenContainerRef = useRef<HTMLDivElement>(null);

  const [tagWidths, setTagWidths] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [gap, setGap] = useState(0);

  const tagsKey = tags?.join('|') ?? '';

  useLayoutEffect(() => {
    const hidden = hiddenContainerRef.current;

    if (!hidden || !tags || tags.length === 0) {
      return;
    }

    const elements = Array.from(hidden.children) as HTMLElement[];
    const widths = new Array(elements.length).fill(0);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const index = elements.indexOf(entry.target as HTMLElement);

        if (index !== -1) {
          widths[index] = entry.contentRect.width;
        }
      }

      setTagWidths([...widths]);
    });

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsKey]);

  // 카드 폭 자체가 반응형으로 바뀌므로, 여기서도 실시간으로 재측정된다.
  useLayoutEffect(() => {
    const container = visibleContainerRef.current;

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
  }, [tagsKey]);

  const visibleCount = useMemo(() => {
    if (!tags || tags.length === 0) {
      return 0;
    }

    const allMeasured =
      tagWidths.length === tags.length && tagWidths.every((w) => w > 0);

    if (!allMeasured) {
      return 0;
    }

    let totalWidth = 0;
    let count = 0;

    for (let i = 0; i < tagWidths.length; i++) {
      const width = tagWidths[i];
      const nextWidth = count === 0 ? width : totalWidth + gap + width;

      if (nextWidth > containerWidth) {
        break;
      }

      totalWidth = nextWidth;
      count++;
    }

    return count;
  }, [tags, tagWidths, containerWidth, gap]);

  return { visibleContainerRef, hiddenContainerRef, visibleCount };
}

function ContentCard({
  image,
  title,
  firstInfo,
  secondInfo,
  liked = false,
  className = '',
  imageClassName = 'h-[115px]',
  tags,
  onClick,
  onLikeClick,
}: ContentCardProps) {
  const { visibleContainerRef, hiddenContainerRef, visibleCount } =
    useResponsiveTagCount(tags);

  return (
    <article
      onClick={onClick}
      className={`
        grow-0
        shrink
        basis-[163px]
        min-w-[140px]
        max-w-[163px]
        h-[222px]
        overflow-hidden
        rounded-xl
        bg-[#F9F9F9]
        shadow-[0_1px_5px_rgba(0,0,0,0.07)]
        cursor-pointer
        ${className}
      `}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-[8px]">
        {image ? (
          <img
            src={image}
            alt={title}
            className={`${imageClassName} w-full object-cover`}
          />
        ) : (
          <div className={`${imageClassName} w-full bg-[#EAEAEA]`} />
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLikeClick?.();
          }}
          className="absolute right-2 top-2"
        >
          <img
            src={liked ? oheart : heart}
            alt="좋아요"
            className="h-4 w-4"
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex h-[107px] min-w-0 flex-col p-2">
        {/* Title */}
        <h3 className="truncate text-[14px] font-medium leading-none text-[#1C1C1C]">
          {title}
        </h3>

        {/* Info */}
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <img
              src={calendar}
              alt=""
              aria-hidden="true"
              className="h-[14px] w-[14px] shrink-0"
            />

            <span className="min-w-0 truncate text-[12px] font-medium leading-none text-[#7F7F7F]">
              {firstInfo}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <img
              src={location}
              alt=""
              aria-hidden="true"
              className="h-[14px] w-[14px] shrink-0"
            />

            <span className="min-w-0 truncate text-[12px] font-medium leading-none text-[#7F7F7F]">
              {secondInfo}
            </span>
          </div>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <>
            <div
              ref={hiddenContainerRef}
              className="absolute invisible flex gap-1"
              aria-hidden="true"
            >
              {tags.map((tag, index) => (
                <TagChip key={`measure-${tag}-${index}`} type={tag} />
              ))}
            </div>

            <div className="mt-auto border-t border-[#E4E4E4] pt-2">
              <div
                ref={visibleContainerRef}
                className="flex flex-nowrap items-center gap-1 overflow-hidden"
              >
                {tags.slice(0, visibleCount).map((tag, index) => (
                  <TagChip key={`${tag}-${index}`} type={tag} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

export default ContentCard;
