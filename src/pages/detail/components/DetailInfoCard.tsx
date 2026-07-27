import call from '../../../assets/icons/call.svg';
import language from '../../../assets/icons/language.svg';
import locationPin from '../../../assets/icons/location-pin.svg';
import schedule from '../../../assets/icons/schedule.svg';
import { useScaleFrame } from '../../../hooks/useScaleFrame';

const CARD_DESIGN_WIDTH = 342;
const CARD_PADDING_X = 20;
const CARD_PADDING_Y = 16;
const ROW_GAP = 5; // 피그마 스펙은 8이지만, 실제 렌더링 시 시각적으로 맞춰본 값(스케일적용)
const ICON_SIZE = 16;
const ICON_TEXT_GAP = 12;
const TEXT_SIZE = 14;

interface DetailInfoCardProps {
  address: string;
  hours: string;
  phone: string;
  website: string;
}

function DetailInfoCard({ address, hours, phone, website }: DetailInfoCardProps) {
  const { outerRef, innerRef, scale, scaledHeight } =
    useScaleFrame(CARD_DESIGN_WIDTH);

  const rows = [
    { key: 'address', icon: locationPin, label: address },
    { key: 'hours', icon: schedule, label: hours },
    { key: 'phone', icon: call, label: phone },
    { key: 'website', icon: language, label: website },
  ];

  return (
    <div
      ref={outerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <div
        ref={innerRef}
        className="flex flex-col rounded-xl border border-gray-2 bg-white"
        style={{
          width: CARD_DESIGN_WIDTH,
          paddingLeft: CARD_PADDING_X,
          paddingRight: CARD_PADDING_X,
          paddingTop: CARD_PADDING_Y,
          paddingBottom: CARD_PADDING_Y,
          gap: ROW_GAP,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center"
            style={{ gap: ICON_TEXT_GAP }}
          >
            <img
              src={row.icon}
              alt=""
              aria-hidden="true"
              className="shrink-0"
              style={{ width: ICON_SIZE, height: ICON_SIZE }}
            />

            <span
              className="font-regular text-gray-5"
              style={{ fontSize: TEXT_SIZE }}
            >
              {row.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DetailInfoCard;
