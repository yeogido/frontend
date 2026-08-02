import location from '../../../assets/icons/location.svg';

import { useScaleFrame } from '../../../hooks/useScaleFrame';

import type { BusinessItem } from '../types';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px (2열 그리드 셀 폭 163 기준)
const CARD_DESIGN_WIDTH = 163;
// 태그 영역(구분선+칩) 제거로 기존 222에서 36(구분선 margin 8 + 태그 margin 8 +
// 태그 높이 20) 만큼 줄인 값. 태그 영역 복구 시 이 값도 222로 되돌릴 것.
const CARD_HEIGHT = 186;
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

// TODO: 백엔드가 목록 API(GET /business-promotions)에 태그 필드
// (hashtags 또는 tags 형태) 추가 시 이 영역(구분선+태그칩) 복구 필요.
// festival 목록 API는 이미 hashtags 필드를 제공 중이므로 그쪽 구현 참고 가능.

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
        </div>
      </div>
    </div>
  );
}

export default BusinessGridCard;
