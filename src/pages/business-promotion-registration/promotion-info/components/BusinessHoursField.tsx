import { useRef } from 'react';
import { useController, type Control } from 'react-hook-form';
import { MdCheck } from 'react-icons/md';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import {
  applyAllDay,
  applyDaysChange,
  applySharedTime,
  getHoursEditorMode,
  getSharedEntry,
  getSharedErrorMessage,
  isAllDayForSelectedDays,
} from '../businessHoursEditor';
import type {
  DayOfWeek,
  DayTimeEntry,
  PromotionInfoFormValues,
} from '../schema';
import DayHoursList from './DayHoursList';
import DayOfWeekSelector from './DayOfWeekSelector';
import TimeRange from './TimeRange';

// Figma 390 디자인(606:3159) 기준 리터럴 px
const ROW_MIN_HEIGHT = 44;
const ROW_GAP = 16;
const ROW_PADDING_X = 14;
const ROW_FONT_SIZE = 12;
const DIVIDER_WIDTH = 24;
const SUB_LABEL_MARGIN_BOTTOM = 8;
const SUB_LABEL_FONT_SIZE = 14;
const ERROR_MARGIN_TOP = 6;
const ERROR_FONT_SIZE = 13;
const CHECK_GAP = 6;
const CHECK_CIRCLE_SIZE = 16;
const CHECK_ICON_SIZE = 12;
const CHECK_FONT_SIZE = 14;

interface BusinessHoursFieldProps {
  readonly control: Control<PromotionInfoFormValues>;
  readonly errorMessageByDay: Partial<Record<DayOfWeek, string>>;
}

/** 고를 시간이 없는 상태(요일 미선택, 24시간)에 보이는 비활성 시간 줄. */
function DisabledTimeRow() {
  const scale = useGlobalScale();
  const box =
    'border-gray-2 bg-background text-gray-3 flex flex-1 items-center border font-medium';
  const boxStyle = {
    minHeight: ROW_MIN_HEIGHT * scale,
    paddingInline: ROW_PADDING_X * scale,
    fontSize: ROW_FONT_SIZE * scale,
    borderRadius: 12 * scale,
  };

  return (
    <fieldset aria-hidden="true">
      <legend
        className="text-gray-5 font-medium"
        style={{
          marginBottom: SUB_LABEL_MARGIN_BOTTOM * scale,
          fontSize: SUB_LABEL_FONT_SIZE * scale,
        }}
      >
        시간
      </legend>
      <div className="flex items-center" style={{ gap: ROW_GAP * scale }}>
        <span className={box} style={boxStyle}>
          선택
        </span>
        <span
          className="bg-gray-3 h-px shrink-0"
          style={{ width: DIVIDER_WIDTH * scale }}
        />
        <span className={box} style={boxStyle}>
          선택
        </span>
      </div>
    </fieldset>
  );
}

/**
 * 영업 시간 입력(모바일). 시안대로 요일 칩 아래 시간 선택 한 줄과 "24시간" 체크를
 * 두고 선택한 요일 전체에 같은 시간을 쓴다. 폼 상태는 요일별(dayTimes) 그대로다.
 * 선택한 요일의 시간이 서로 다르면(요일마다 다르게 만든 글을 수정할 때) 한 줄이
 * 다른 요일의 시간을 덮어쓰지 않도록 기존 요일별 목록을 보여 준다.
 */
function BusinessHoursField({
  control,
  errorMessageByDay,
}: BusinessHoursFieldProps) {
  const scale = useGlobalScale();
  const { field: daysField } = useController({ control, name: 'openDays' });
  const { field: timesField } = useController({ control, name: 'dayTimes' });
  // 24시간을 잘못 눌러도 끄면 입력해 둔 시간이 돌아오게 보관한다.
  const beforeAllDayRef = useRef<DayTimeEntry>({});

  const openDays = daysField.value;
  const dayTimes = timesField.value;
  const hasDays = openDays.length > 0;
  const mode = getHoursEditorMode(openDays, dayTimes);

  const handleDaysChange = (nextDays: DayOfWeek[]) => {
    timesField.onChange(applyDaysChange(openDays, nextDays, dayTimes));
    daysField.onChange(nextDays);
  };

  if (mode === 'perDay') {
    return (
      <>
        <DayOfWeekSelector value={openDays} onChange={handleDaysChange} />
        <DayHoursList
          selectedDays={openDays}
          dayTimes={dayTimes}
          errorMessageByDay={errorMessageByDay}
          onChangeDayTime={(day, timeField, value) =>
            timesField.onChange({
              ...dayTimes,
              [day]: { ...dayTimes[day], [timeField]: value },
            })
          }
        />
      </>
    );
  }

  const shared = getSharedEntry(openDays, dayTimes);
  const isAllDay = isAllDayForSelectedDays(openDays, dayTimes);
  const errorMessage = getSharedErrorMessage(openDays, errorMessageByDay);

  return (
    <>
      <DayOfWeekSelector value={openDays} onChange={handleDaysChange} />

      {hasDays && !isAllDay ? (
        <TimeRange
          legend="시간"
          idPrefix="promotion-hours-shared"
          startValue={shared.openTime}
          endValue={shared.closeTime}
          onStartChange={(openTime) =>
            timesField.onChange(
              applySharedTime(openDays, dayTimes, { openTime })
            )
          }
          onEndChange={(closeTime) =>
            timesField.onChange(
              applySharedTime(openDays, dayTimes, { closeTime })
            )
          }
        />
      ) : (
        <DisabledTimeRow />
      )}

      {errorMessage && !isAllDay ? (
        <p
          className="text-main-5"
          style={{
            marginTop: -ROW_GAP * scale + ERROR_MARGIN_TOP * scale,
            fontSize: ERROR_FONT_SIZE * scale,
          }}
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <label
        className={`flex items-center self-end font-medium ${
          hasDays ? 'cursor-pointer' : ''
        } ${isAllDay ? 'text-main-5' : 'text-gray-4'}`}
        style={{ gap: CHECK_GAP * scale, fontSize: CHECK_FONT_SIZE * scale }}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          checked={isAllDay}
          disabled={!hasDays}
          onChange={(event) => {
            const { checked } = event.target;

            if (checked) beforeAllDayRef.current = shared;
            timesField.onChange(
              applyAllDay(openDays, dayTimes, checked, beforeAllDayRef.current)
            );
          }}
        />
        <span
          aria-hidden="true"
          className={`peer-focus-visible:outline-main-5 flex items-center justify-center rounded-full border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${
            isAllDay
              ? 'border-main-5 bg-main-5 text-white'
              : 'border-gray-3 text-gray-3 bg-white'
          }`}
          style={{
            width: CHECK_CIRCLE_SIZE * scale,
            height: CHECK_CIRCLE_SIZE * scale,
          }}
        >
          <MdCheck style={{ fontSize: CHECK_ICON_SIZE * scale }} />
        </span>
        24시간
      </label>
    </>
  );
}

export default BusinessHoursField;
