import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import { dayOfWeekOptions } from '../constants/options';
import type { DayOfWeek, DayTimeEntry } from '../schema';
import TimeRange from './TimeRange';

// Figma엔 요일별 개별 시간 입력 시안이 없어(원래는 요일 다중선택 + 시간
// 1쌍이었다), 선택한 요일을 일~토 순서로 나열하고 요일마다 그 아래에
// 전용 TimeRange를 붙이는 형태로 직접 설계했다.
const LIST_GAP = 20;
const ERROR_MARGIN_TOP = 6;
const ERROR_FONT_SIZE = 13;

interface DayHoursListProps {
  selectedDays: readonly DayOfWeek[];
  dayTimes: Partial<Record<DayOfWeek, DayTimeEntry>>;
  errorMessageByDay: Partial<Record<DayOfWeek, string>>;
  onChangeDayTime: (
    day: DayOfWeek,
    field: 'openTime' | 'closeTime',
    value: string
  ) => void;
}

function DayHoursList({
  selectedDays,
  dayTimes,
  errorMessageByDay,
  onChangeDayTime,
}: DayHoursListProps) {
  const scale = useGlobalScale();
  const orderedDays = dayOfWeekOptions.filter((option) =>
    selectedDays.includes(option.value)
  );

  if (orderedDays.length === 0) return null;

  return (
    <div className="flex flex-col" style={{ gap: LIST_GAP * scale }}>
      {orderedDays.map((option) => {
        const hour = dayTimes[option.value];
        const errorMessage = errorMessageByDay[option.value];

        return (
          <div key={option.value}>
            <TimeRange
              legend={`${option.label}요일`}
              idPrefix={`promotion-hours-${option.value}`}
              startValue={hour?.openTime}
              endValue={hour?.closeTime}
              onStartChange={(value) =>
                onChangeDayTime(option.value, 'openTime', value)
              }
              onEndChange={(value) =>
                onChangeDayTime(option.value, 'closeTime', value)
              }
            />
            {errorMessage ? (
              <p
                className="text-main-5"
                style={{
                  marginTop: ERROR_MARGIN_TOP * scale,
                  fontSize: ERROR_FONT_SIZE * scale,
                }}
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default DayHoursList;
