import heart from '../../assets/icons/heart.svg';

import { useGlobalScale } from '../../hooks/useGlobalScale';

const CARD_WIDTH = 163;
const CARD_HEIGHT = 222;
const IMAGE_HEIGHT = 115;
const CONTENT_PADDING = 8;
const HEART_SIZE = 16;
const HEART_OFFSET = 8;
const TITLE_HEIGHT = 14;
const TITLE_WIDTH = 88;
const INFO_ICON_SIZE = 14;
const INFO_TEXT_HEIGHT = 12;
const INFO_GAP = 4;
const INFO_MARGIN_TOP = 8;
const TAG_HEIGHT = 20;
const TAG_GAP = 4;
const TAG_MARGIN_TOP = 8;

interface ContentCardSkeletonProps {
  className?: string;
  imageClassName?: string;
}

function ContentCardSkeleton({
  className = '',
  imageClassName = '',
}: ContentCardSkeletonProps) {
  const scale = useGlobalScale();
  const hasCustomWidth = /(?:^|\s)(?:w-|min-w|max-w)/.test(className);
  const hasCustomImageHeight = /(?:^|\s)(?:h-|min-h|max-h|aspect-)/.test(
    imageClassName
  );

  return (
    <div
      className={`shrink-0 overflow-hidden ${className}`}
      style={{
        width: hasCustomWidth ? undefined : CARD_WIDTH * scale,
        height: CARD_HEIGHT * scale,
      }}
    >
      <article
        className="flex h-full w-full animate-pulse flex-col overflow-hidden rounded-xl bg-[#F9F9F9] shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div className="relative overflow-hidden rounded-[8px]">
          <div
            className={`w-full bg-[#EAEAEA] ${imageClassName}`}
            style={{ height: hasCustomImageHeight ? undefined : IMAGE_HEIGHT }}
          />
          <div
            className="absolute"
            style={{ top: HEART_OFFSET, right: HEART_OFFSET }}
          >
            <img
              src={heart}
              alt=""
              aria-hidden="true"
              style={{ width: HEART_SIZE, height: HEART_SIZE }}
            />
          </div>
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col"
          style={{ padding: CONTENT_PADDING }}
        >
          <div
            className="rounded bg-[#EAEAEA]"
            style={{ width: TITLE_WIDTH, height: TITLE_HEIGHT }}
          />

          <div
            className="flex flex-col"
            style={{ marginTop: INFO_MARGIN_TOP, gap: INFO_GAP }}
          >
            {[56, 72].map((textWidth) => (
              <div
                key={textWidth}
                className="flex items-center"
                style={{ gap: INFO_GAP }}
              >
                <div
                  className="rounded-full bg-[#EAEAEA]"
                  style={{ width: INFO_ICON_SIZE, height: INFO_ICON_SIZE }}
                />
                <div
                  className="rounded bg-[#EAEAEA]"
                  style={{ width: textWidth, height: INFO_TEXT_HEIGHT }}
                />
              </div>
            ))}
          </div>

          <div
            className="mt-auto border-t border-[#E4E4E4]"
            style={{ paddingTop: TAG_MARGIN_TOP }}
          >
            <div className="flex" style={{ gap: TAG_GAP }}>
              <div
                className="rounded-full bg-[#EAEAEA]"
                style={{ width: 48, height: TAG_HEIGHT }}
              />
              <div
                className="rounded-full bg-[#EAEAEA]"
                style={{ width: 56, height: TAG_HEIGHT }}
              />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default ContentCardSkeleton;
