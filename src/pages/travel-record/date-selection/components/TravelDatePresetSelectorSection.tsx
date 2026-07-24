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
  hasIcon: boolean;
}[] = [
  { id: 'today', label: '오늘', hasIcon: true },
  { id: 'yesterday', label: '어제', hasIcon: true },
  { id: 'this-week', label: '이번주', hasIcon: false },
  { id: 'custom', label: '직접 선택', hasIcon: true },
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
      <div className="flex h-full items-center px-3">
        {presets.map((preset, index) => {
          const isSelected = selectedPreset === preset.id;

          return (
            <div key={preset.id} className="flex min-w-0 flex-1 items-center">
              <button
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`mx-auto flex h-[31px] max-w-full items-center justify-center gap-1 rounded-xl px-2.5 text-[12px] leading-none font-medium whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#f9f9f9] text-[#ff6f41]'
                    : 'text-[#505050]'
                }`}
              >
                {preset.hasIcon ? (
                  <img
                    src={isSelected ? calendarIconActive : calendarIcon}
                    alt=""
                    aria-hidden="true"
                    className="size-[18px] shrink-0"
                  />
                ) : null}
                <span className="whitespace-nowrap">{preset.label}</span>
              </button>
              {index < presets.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="h-[18px] w-px shrink-0 bg-[#e4e4e4]"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TravelDatePresetSelectorSection;
