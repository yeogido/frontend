import { Fragment } from 'react';

import calendarIconActive from '../assets/calendar-icon-active.svg';
import calendarIcon from '../assets/calendar-icon.svg';
import type { TravelDatePreset } from '../types';

interface TravelDatePresetSelectorSectionProps {
  selectedPreset: TravelDatePreset;
  onSelectPreset: (preset: TravelDatePreset) => void;
}

const presets: {
  id: TravelDatePreset;
  label: string;
}[] = [
  { id: 'today', label: '오늘' },
  { id: 'yesterday', label: '어제' },
  { id: 'this-week', label: '이번주' },
  { id: 'custom', label: '직접 선택' },
];

function TravelDatePresetSelectorSection({
  selectedPreset,
  onSelectPreset,
}: TravelDatePresetSelectorSectionProps) {
  return (
    <section
      className="absolute top-[237px] left-6 h-[52px] w-[342px] overflow-hidden rounded-xl bg-[#f1f1f1]"
      aria-label="날짜 빠른 선택"
    >
      {/* 칸을 균등 분할하면 글자 수가 다른 버튼이 각자 칸 안에서 가운데로
          몰려 구분선과의 간격이 제각각이 된다. 버튼과 구분선을 한 줄에 나열해
          남는 폭을 모든 틈에 똑같이 나눠 준다. */}
      <div className="flex h-full items-center justify-between px-3">
        {presets.map((preset, index) => {
          const isSelected = selectedPreset === preset.id;

          return (
            <Fragment key={preset.id}>
              <button
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`flex h-[31px] shrink-0 items-center justify-center gap-1 rounded-xl px-2.5 text-[12px] leading-none font-medium whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#f9f9f9] text-[#ff6f41]'
                    : 'text-[#505050]'
                }`}
              >
                <img
                  src={isSelected ? calendarIconActive : calendarIcon}
                  alt=""
                  aria-hidden="true"
                  className="size-[18px] shrink-0"
                />
                <span className="whitespace-nowrap">{preset.label}</span>
              </button>
              {index < presets.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="h-[18px] w-px shrink-0 bg-[#e4e4e4]"
                />
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}

export default TravelDatePresetSelectorSection;
