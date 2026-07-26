import { IoClose } from 'react-icons/io5';

import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { scaleValue } from '../../../../utils/responsiveLayout';

const HEADER_GAP = 16;
const TITLE_FONT_SIZE = 18;
const TITLE_LINE_HEIGHT = 24;
const DESCRIPTION_MARGIN_TOP = 8;
const DESCRIPTION_FONT_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 20;
const CLOSE_VISUAL_SIZE = 32;
const CLOSE_ICON_SIZE = 24;

interface PlacePhotoModalHeaderProps {
  onClose: () => void;
}

function PlacePhotoModalHeader({ onClose }: PlacePhotoModalHeaderProps) {
  const scale = useGlobalScale();
  const closeButtonSize = scaleValue(
    CLOSE_VISUAL_SIZE,
    scale,
    MIN_TOUCH_TARGET
  );
  const closeVisualSize = CLOSE_VISUAL_SIZE * scale;
  const closeOverlap = (closeButtonSize - closeVisualSize) / -2;

  return (
    <div
      className="flex min-w-0 items-start justify-between"
      style={{ gap: HEADER_GAP * scale }}
    >
      <div className="min-w-0">
        <h2
          id="place-photo-modal-title"
          className="font-semibold text-black"
          style={{
            fontSize: scaleValue(TITLE_FONT_SIZE, scale, 16),
            lineHeight: `${scaleValue(TITLE_LINE_HEIGHT, scale, 21)}px`,
          }}
        >
          장소에 <br /> 사진을 추가해 주세요
        </h2>
        <p
          className="text-gray-5"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: scaleValue(DESCRIPTION_FONT_SIZE, scale, 12),
            lineHeight: `${scaleValue(DESCRIPTION_LINE_HEIGHT, scale, 18)}px`,
          }}
        >
          장소를 더 매력적으로 소개할 수 있어요!
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="사진 등록 닫기"
        className="text-gray-5 flex shrink-0 items-center justify-center rounded-full"
        style={{
          width: closeButtonSize,
          height: closeButtonSize,
          marginTop: closeOverlap,
          marginRight: closeOverlap,
        }}
      >
        <IoClose
          aria-hidden="true"
          style={{ fontSize: CLOSE_ICON_SIZE * scale }}
        />
      </button>
    </div>
  );
}

export default PlacePhotoModalHeader;
