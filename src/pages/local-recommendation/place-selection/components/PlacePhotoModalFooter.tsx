import { MIN_TOUCH_TARGET } from '../../../../constants/layout';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
import { scaleValue } from '../../../../utils/responsiveLayout';

const FOOTER_MARGIN_TOP = 24;
const BUTTON_HEIGHT = 53;
const BUTTON_RADIUS = 12;
const BUTTON_FONT_SIZE = 18;

interface PlacePhotoModalFooterProps {
  previewUrl: string | null;
  onConfirm: () => void;
}

function PlacePhotoModalFooter({
  previewUrl,
  onConfirm,
}: PlacePhotoModalFooterProps) {
  const scale = useGlobalScale();

  return (
    <button
      type="button"
      disabled={!previewUrl}
      onClick={onConfirm}
      className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full shrink-0 font-semibold disabled:cursor-not-allowed"
      style={{
        marginTop: FOOTER_MARGIN_TOP * scale,
        height: scaleValue(BUTTON_HEIGHT, scale, MIN_TOUCH_TARGET),
        borderRadius: BUTTON_RADIUS * scale,
        fontSize: scaleValue(BUTTON_FONT_SIZE, scale, 16),
      }}
    >
      사진 추가하기
    </button>
  );
}

export default PlacePhotoModalFooter;
