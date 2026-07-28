import location from '../../../assets/icons/location.svg';
import TagChip from '../../../components/common/TagChip';

import { useScaleFrame } from '../../../hooks/useScaleFrame';

import type { BusinessItem } from '../types';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px (2열 그리드 셀 폭 163 기준)
const CARD_DESIGN_WIDTH = 163;
const CARD_HEIGHT = 222;
const IMAGE_HEIGHT = 115;

const CONTENT_PADDING_X = 8;
const CONTENT_PADDING_TOP = 8;
const CONTENT_PADDING_BOTTOM = 8;

const TITLE_SIZE = 14;
const TITLE_LINE_HEIGHT = 16;
const DESCRIPTION_MARGIN_TOP = 4;
const DESCRIPTION_SIZE = 10;
const DESCRIPTION_LINE_HEIGHT = 11;

const LOCATION_MARGIN_TOP = 12;
const LOCATION_GAP = 4;
const LOCATION_ICON_SIZE = 14;
const LOCATION_TEXT_SIZE = 12;

const DIVIDER_MARGIN_TOP = 8;

const TAG_MARGIN_TOP = 8;
const TAG_GAP = 4;
const TAG_HEIGHT = 20;
const TAG_WIDTH = 46;

interface BusinessGridCardProps {
  business: BusinessItem;
  onClick: () => void;
}

function BusinessGridCard({ business, onClick }: BusinessGridCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <div
        ref={innerRef}
        onClick={onClick}
        role="button"
        tabIndex={0}
        className="flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
        style={{
          width: CARD_DESIGN_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <img
          src={business.image}
          alt={business.title}
          className="w-full rounded-t-lg object-cover"
          style={{ height: IMAGE_HEIGHT }}
        />

        <div
          className="flex min-h-0 flex-1 flex-col"
          style={{
            paddingLeft: CONTENT_PADDING_X,
            paddingRight: CONTENT_PADDING_X,
            paddingTop: CONTENT_PADDING_TOP,
            paddingBottom: CONTENT_PADDING_BOTTOM,
          }}
        >
          <h2
            className="truncate font-medium text-[#1C1C1C]"
            style={{
              fontSize: TITLE_SIZE,
              lineHeight: `${TITLE_LINE_HEIGHT}px`,
            }}
          >
            {business.title}
          </h2>

          <p
            className="truncate font-normal text-[#7F7F7F]"
            style={{
              marginTop: DESCRIPTION_MARGIN_TOP,
              fontSize: DESCRIPTION_SIZE,
              lineHeight: `${DESCRIPTION_LINE_HEIGHT}px`,
            }}
          >
            {business.description}
          </p>

          <div
            className="flex items-center"
            style={{ marginTop: LOCATION_MARGIN_TOP, gap: LOCATION_GAP }}
          >
            <img
              src={location}
              alt=""
              aria-hidden="true"
              className="shrink-0"
              style={{ width: LOCATION_ICON_SIZE, height: LOCATION_ICON_SIZE }}
            />

            <span
              className="font-medium leading-none text-[#7F7F7F]"
              style={{ fontSize: LOCATION_TEXT_SIZE }}
            >
              {business.location}
            </span>
          </div>

          <div
            className="border-t border-[#E4E4E4]"
            style={{ marginTop: DIVIDER_MARGIN_TOP }}
          />

          <div
            className="flex w-full flex-nowrap justify-center"
            style={{ marginTop: TAG_MARGIN_TOP, gap: TAG_GAP }}
          >
            {business.tags.slice(0, 3).map((tag) => (
              <TagChip
                key={`${business.id}-${tag}`}
                type={tag}
                style={{ height: TAG_HEIGHT, width: TAG_WIDTH }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessGridCard;
