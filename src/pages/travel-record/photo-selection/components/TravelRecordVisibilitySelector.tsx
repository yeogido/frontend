import type { TravelRecordApiVisibility } from '../../../../types/travelRecord.type';
import privateIcon from '../assets/visibility-private.svg';
import selectedPrivateIcon from '../assets/visibility-private-selected.svg';
import friendsIcon from '../assets/visibility-friends.svg';
import publicIcon from '../assets/visibility-public.svg';

const options = [
  { value: 'PRIVATE', label: '나만 보기', icon: privateIcon },
  { value: 'FRIENDS', label: '친구 공개', icon: friendsIcon },
  { value: 'PUBLIC', label: '전체 공개', icon: publicIcon },
] as const;

interface Props {
  value: TravelRecordApiVisibility | undefined;
  canSelect: (value: TravelRecordApiVisibility) => boolean;
  onChange: (value: TravelRecordApiVisibility) => void;
}

export default function TravelRecordVisibilitySelector({
  value,
  canSelect,
  onChange,
}: Props) {
  return (
    <section className="absolute top-[601px] left-6 w-[342px]">
      <h2
        id="travel-record-visibility-title"
        className="text-[16px] leading-[normal] font-semibold text-[#1c1c1c]"
      >
        공개범위 설정
      </h2>
      <div
        role="radiogroup"
        aria-labelledby="travel-record-visibility-title"
        className="mt-4 flex gap-[15px]"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!canSelect(option.value)}
              onClick={() => onChange(option.value)}
              className={`flex h-[74px] w-[104px] flex-col items-center justify-center gap-0.5 rounded-xl border text-[10px] leading-[normal] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6f41] disabled:cursor-default ${selected ? 'border-[#ff6f41] bg-[#ffebe5] text-[#ff6f41]' : 'border-[#e4e4e4] bg-[#f9f9f9] text-[#505050]'}`}
            >
              <img
                src={
                  selected && option.value === 'PRIVATE'
                    ? selectedPrivateIcon
                    : option.icon
                }
                alt=""
                aria-hidden="true"
              />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
