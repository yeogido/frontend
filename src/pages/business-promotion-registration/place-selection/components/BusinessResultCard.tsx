import { IoAdd } from 'react-icons/io5';

import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import type { BusinessInfoResponse } from '../../../../types/business.type';
import { isBusinessPromoting } from '../../../../utils/businessPromotionStatus';

import PlaceMarkerIcon from './PlaceMarkerIcon';

// Figma 390 디자인(606:3062, 7118:51342) 기준 리터럴 px
const ROW_MIN_HEIGHT = 68;
const MARKER_GAP = 12;
const MARKER_LEFT_INSET = 4;
const MARKER_WIDTH = 16;
const MARKER_HEIGHT = 20;
const NAME_FONT_SIZE = 16;
const NAME_LINE_HEIGHT = 20;
const ADDRESS_MARGIN_TOP = 8;
const ADDRESS_FONT_SIZE = 14;
const ADDRESS_LINE_HEIGHT = 20;
const ACTION_SIZE = 24;
const ACTION_ICON_SIZE = 16;
const ACTION_RADIUS = 6;
const CHIP_PADDING_X = 8;
const CHIP_PADDING_Y = 6;
const CHIP_RADIUS = 8;
const CHIP_FONT_SIZE = 12;
// 사업장 응답에 이미지가 없어 사진 대신 핀 아이콘을 쓴다. 시안의 검은 50% 덮개
// 대신 아이콘을 흐리게 한다.
const PROMOTING_MARKER_OPACITY = 0.5;

interface BusinessResultCardProps {
  readonly business: BusinessInfoResponse;
  /** 이미 고른 사업장이면 추가 버튼을 막는다. */
  readonly isSelected: boolean;
  readonly onAdd: (business: BusinessInfoResponse) => void;
}

/**
 * 사업장 목록의 한 줄. 이미 홍보 중인 사업장은 흐리게 하고 추가 버튼 자리에
 * "홍보중" 칩을 두며, 눌러도 선택되지 않는다.
 */
function BusinessResultCard({
  business,
  isSelected,
  onAdd,
}: BusinessResultCardProps) {
  const scale = useGlobalScale();
  const isPromoting = isBusinessPromoting(business);
  // 시각 크기는 24px로 두고 터치 영역만 44px 이상으로 넓힌다.
  const actionButtonSize = Math.max(MIN_TOUCH_TARGET, ACTION_SIZE * scale);
  const actionVisualSize = ACTION_SIZE * scale;
  const actionOverlap = (actionButtonSize - actionVisualSize) / -2;

  return (
    <article
      className="flex min-w-0 items-center"
      style={{
        minHeight: ROW_MIN_HEIGHT * scale,
        gap: MARKER_GAP * scale,
      }}
    >
      <PlaceMarkerIcon
        aria-hidden="true"
        className="shrink-0 self-start"
        style={{
          width: MARKER_WIDTH * scale,
          height: MARKER_HEIGHT * scale,
          marginLeft: MARKER_LEFT_INSET * scale,
          opacity: isPromoting ? PROMOTING_MARKER_OPACITY : undefined,
        }}
      />

      <div className="min-w-0 flex-1">
        <h3
          className={`truncate font-semibold ${
            isPromoting ? 'text-gray-4' : 'text-black'
          }`}
          style={{
            fontSize: NAME_FONT_SIZE * scale,
            lineHeight: `${NAME_LINE_HEIGHT * scale}px`,
          }}
        >
          {business.businessName}
        </h3>
        <p
          className={`truncate ${isPromoting ? 'text-gray-3' : 'text-gray-5'}`}
          style={{
            marginTop: ADDRESS_MARGIN_TOP * scale,
            fontSize: ADDRESS_FONT_SIZE * scale,
            lineHeight: `${ADDRESS_LINE_HEIGHT * scale}px`,
          }}
        >
          {business.businessAddress}
        </p>
      </div>

      {isPromoting ? (
        // 누를 수 없는 상태를 보조기기에 알리려고 disabled 대신 aria-disabled를
        // 쓴다(포커스는 받되 아무 일도 하지 않는다).
        <button
          type="button"
          aria-disabled="true"
          aria-label={`${business.businessName} 홍보중, 선택할 수 없어요`}
          onClick={(event) => event.preventDefault()}
          className="bg-gray-2 text-gray-4 shrink-0 cursor-default font-medium"
          style={{
            padding: `${CHIP_PADDING_Y * scale}px ${CHIP_PADDING_X * scale}px`,
            borderRadius: CHIP_RADIUS * scale,
            fontSize: CHIP_FONT_SIZE * scale,
            lineHeight: 'normal',
          }}
        >
          홍보중
        </button>
      ) : (
        <button
          type="button"
          disabled={isSelected}
          onClick={() => onAdd(business)}
          aria-label={`${business.businessName} 추가`}
          className="text-gray-3 flex shrink-0 items-center justify-center disabled:cursor-default disabled:opacity-40"
          style={{
            width: actionButtonSize,
            height: actionButtonSize,
            marginLeft: actionOverlap,
            marginRight: actionOverlap,
          }}
        >
          <span
            className="border-gray-2 flex items-center justify-center border bg-white"
            style={{
              width: actionVisualSize,
              height: actionVisualSize,
              borderRadius: ACTION_RADIUS * scale,
            }}
          >
            <IoAdd
              aria-hidden="true"
              style={{ fontSize: ACTION_ICON_SIZE * scale }}
            />
          </span>
        </button>
      )}
    </article>
  );
}

export default BusinessResultCard;
