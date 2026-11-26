import { Controller } from 'react-hook-form';
import { MdCheck } from 'react-icons/md';

import type { BusinessInfoResponse } from '../../../../types/business.type';
import DesktopStepLayout from '../../components/DesktopStepLayout';
import TimeRange from '../components/TimeRange';
import { dayOfWeekOptions } from '../constants/options';
import type { DayOfWeek, DayTimeEntry } from '../schema';
import {
  usePromotionInfoForm,
  type UsePromotionInfoFormParams,
} from '../usePromotionInfoForm';

// Figma 1440 데스크톱 시안(7193:17879 / 7193:45352) 기준 리터럴 px
const DESCRIPTION_MAX_LENGTH = 255;
// 24시간 영업은 00:00-23:59로 저장한다(utils/operatingHours.ts의 규칙).
const ALL_DAY = { openTime: '00:00', closeTime: '23:59' } as const;

const FIELD_CLASS = 'flex flex-col gap-[20px]';
const LABEL_CLASS = 'text-[20px] leading-[24px] font-semibold text-black';
const SUB_LABEL_CLASS = 'text-gray-5 text-[16px] leading-[19px]';
const INPUT_CLASS =
  'border-gray-2 placeholder:text-gray-4 focus:border-main-5 h-[59px] w-full rounded-[12px] border bg-white px-[20px] text-[16px] font-medium outline-none';

function isAllDay(entry: DayTimeEntry | undefined) {
  return (
    entry?.openTime === ALL_DAY.openTime &&
    entry.closeTime === ALL_DAY.closeTime
  );
}

/** 고를 시간이 없는 상태(요일 미선택·24시간)에 보여주는 비활성 시간 줄. */
function DisabledTimeRow() {
  const box =
    'border-gray-2 bg-background text-gray-3 flex h-[59px] flex-1 items-center rounded-[12px] border px-[20px] text-[16px] font-medium';

  return (
    <div className="flex items-center gap-[20px]" aria-hidden="true">
      <span className={box}>선택</span>
      <span className="bg-gray-3 h-px w-[24px] shrink-0" />
      <span className={box}>선택</span>
    </div>
  );
}

interface PromotionInfoDesktopViewProps extends UsePromotionInfoFormParams {
  readonly business: Pick<
    BusinessInfoResponse,
    'businessName' | 'businessAddress'
  >;
  readonly onBack: () => void;
}

/**
 * 홍보글 기본 정보 — 데스크톱 뷰. 시안은 시간 입력이 한 줄이지만, 요일별
 * 시간을 따로 저장하기로 한 결정(schema.ts)을 따라 고른 요일마다 한 줄씩 둔다.
 */
function PromotionInfoDesktopView({
  business,
  onBack,
  ...formParams
}: PromotionInfoDesktopViewProps) {
  const {
    register,
    control,
    submitForm,
    openDays,
    dayTimes,
    shortDescription,
    dayTimeErrorMessageByDay,
    isReady,
    isSubmitting,
  } = usePromotionInfoForm(formParams);

  const orderedDays = dayOfWeekOptions.filter((option) =>
    openDays.includes(option.value)
  );
  const isEveryDayAllDay =
    openDays.length > 0 && openDays.every((day) => isAllDay(dayTimes[day]));

  return (
    <DesktopStepLayout
      title="홍보글 정보를 입력해주세요"
      description="사업장의 기본 정보를 입력해주세요"
      onBack={onBack}
    >
      <form onSubmit={submitForm} className="mt-[60px] flex flex-col">
        <div className="flex flex-col gap-[40px]">
          <div className="bg-background flex items-center gap-[24px] rounded-[12px] px-[12px] py-[16px]">
            {/* 사업장 사진은 API에 없어 빈 상자로 둔다. */}
            <div
              className="bg-gray-2 h-[76px] w-[103px] shrink-0 rounded-[8px]"
              aria-hidden="true"
            />
            <div className="flex min-w-0 flex-col gap-[8px]">
              <p className="truncate text-[20px] font-semibold text-black">
                {business.businessName}
              </p>
              <p className="text-gray-5 truncate text-[18px]">
                {business.businessAddress}
              </p>
            </div>
          </div>

          <div className={FIELD_CLASS}>
            <label
              htmlFor="promotion-short-description"
              className={LABEL_CLASS}
            >
              사업장을 소개해주세요
            </label>
            <div className="flex flex-col items-end gap-[12px]">
              <input
                {...register('shortDescription')}
                id="promotion-short-description"
                type="text"
                maxLength={DESCRIPTION_MAX_LENGTH}
                placeholder="여행자들에게 전하고 싶은 한마디를 적어보세요"
                className={INPUT_CLASS}
              />
              <span className="text-gray-4 text-[16px] leading-[19px]">
                ({shortDescription.length}/{DESCRIPTION_MAX_LENGTH})
              </span>
            </div>
          </div>

          <div className={FIELD_CLASS}>
            <h2 className={LABEL_CLASS}>영업 시간을 알려주세요</h2>

            <Controller
              control={control}
              name="dayTimes"
              render={({ field: timesField }) => (
                <>
                  <Controller
                    control={control}
                    name="openDays"
                    render={({ field: daysField }) => (
                      <fieldset>
                        <legend className={`${SUB_LABEL_CLASS} mb-[6px]`}>
                          요일
                        </legend>
                        <div className="grid grid-cols-7 gap-[12px]">
                          {dayOfWeekOptions.map((option) => {
                            const day: DayOfWeek = option.value;
                            const selected = daysField.value.includes(day);

                            return (
                              <button
                                key={day}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => {
                                  // 24시간을 켠 채 요일을 더하면 그 요일도
                                  // 24시간으로 맞춘다.
                                  if (!selected && isEveryDayAllDay) {
                                    timesField.onChange({
                                      ...timesField.value,
                                      [day]: ALL_DAY,
                                    });
                                  }
                                  daysField.onChange(
                                    selected
                                      ? daysField.value.filter(
                                          (value) => value !== day
                                        )
                                      : [...daysField.value, day]
                                  );
                                }}
                                className={`aspect-square rounded-[20px] border text-[18px] font-medium ${
                                  selected
                                    ? 'border-main-5 bg-main-2 text-main-5'
                                    : 'border-gray-2 text-gray-5 bg-white'
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    )}
                  />

                  <div className="flex flex-col gap-[6px]">
                    <p className={SUB_LABEL_CLASS}>시간</p>
                    {orderedDays.length === 0 || isEveryDayAllDay ? (
                      <DisabledTimeRow />
                    ) : (
                      <div className="flex flex-col gap-[20px]">
                        {orderedDays.map((option) => {
                          const day: DayOfWeek = option.value;
                          const entry = timesField.value[day];
                          const errorMessage = dayTimeErrorMessageByDay[day];
                          const setEntry = (next: DayTimeEntry) =>
                            timesField.onChange({
                              ...timesField.value,
                              [day]: next,
                            });

                          return (
                            <div key={day}>
                              {isAllDay(entry) ? (
                                <p className="text-gray-5 flex items-center justify-between text-[16px] font-medium">
                                  {option.label}요일 24시간 영업
                                  <button
                                    type="button"
                                    onClick={() => setEntry({})}
                                    className="text-main-5"
                                  >
                                    시간 선택
                                  </button>
                                </p>
                              ) : (
                                <TimeRange
                                  legend={`${option.label}요일`}
                                  idPrefix={`promotion-hours-${day}`}
                                  startValue={entry?.openTime}
                                  endValue={entry?.closeTime}
                                  onStartChange={(openTime) =>
                                    setEntry({ ...entry, openTime })
                                  }
                                  onEndChange={(closeTime) =>
                                    setEntry({ ...entry, closeTime })
                                  }
                                />
                              )}
                              {errorMessage ? (
                                <p
                                  className="text-main-5 mt-[6px] text-[14px]"
                                  role="alert"
                                >
                                  {errorMessage}
                                </p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <label
                    className={`flex items-center gap-[6px] self-end text-[18px] leading-[21px] font-medium ${
                      openDays.length > 0 ? 'cursor-pointer' : ''
                    } ${isEveryDayAllDay ? 'text-main-5' : 'text-gray-4'}`}
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={isEveryDayAllDay}
                      disabled={openDays.length === 0}
                      onChange={(event) => {
                        const next = { ...timesField.value };
                        openDays.forEach((day) => {
                          next[day] = event.target.checked ? ALL_DAY : {};
                        });
                        timesField.onChange(next);
                      }}
                    />
                    <span
                      aria-hidden="true"
                      className={`peer-focus-visible:outline-main-5 flex size-[20px] items-center justify-center rounded-full border-[1.5px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${
                        isEveryDayAllDay
                          ? 'border-main-5 bg-main-5 text-white'
                          : 'border-gray-3 text-gray-3 bg-white'
                      }`}
                    >
                      <MdCheck className="text-[16px]" />
                    </span>
                    24시간
                  </label>
                </>
              )}
            />
          </div>

          <div className={FIELD_CLASS}>
            <label htmlFor="promotion-phone-number" className={LABEL_CLASS}>
              연락 가능한 전화번호를 입력해 주세요
            </label>
            <input
              {...register('phoneNumber')}
              id="promotion-phone-number"
              type="tel"
              placeholder="010-0000-0000"
              className={INPUT_CLASS}
            />
          </div>

          <div className={FIELD_CLASS}>
            <label htmlFor="promotion-sns-account" className={LABEL_CLASS}>
              SNS 계정이 있다면 알려주세요(선택)
            </label>
            <input
              {...register('snsAccount')}
              id="promotion-sns-account"
              type="text"
              placeholder="instagram.com/아이디"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isReady}
          className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 mt-[60px] h-[61px] w-full rounded-[12px] text-[24px] font-semibold text-white disabled:cursor-not-allowed"
        >
          사진 추가하기
        </button>
      </form>
    </DesktopStepLayout>
  );
}

export default PromotionInfoDesktopView;
