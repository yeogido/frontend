import { Controller } from 'react-hook-form';
import { FaCar, FaPersonWalking } from 'react-icons/fa6';
import {
  MdDiversity3,
  MdFace,
  MdFavorite,
  MdGroup,
  MdPets,
} from 'react-icons/md';

import { companionOptions, transportOptions } from '../constants/options';
import DurationSelect from '../components/DurationSelect';
import FormField from '../components/FormField';
import VisitMonthRange from '../components/VisitMonthRange';
import type { CourseBasicInfoValues } from '../schema';
import { useCourseBasicInfoForm } from '../useCourseBasicInfoForm';

// Figma 1440 데스크톱 시안(6360:38445) 기준 리터럴 px.
// 데스크톱은 뷰포트 폭에 따라 키우지 않으므로 scale을 곱하지 않는다.
const TRANSPORT_CARD_HEIGHT = 225;
const TRANSPORT_ICON_SIZE = 48;
const COMPANION_CARD_HEIGHT = 133;
const COMPANION_ICON_SIZE = 36;

const transportIcons = {
  walking: FaPersonWalking,
  car: FaCar,
};

const companionIcons = {
  solo: MdFace,
  friends: MdGroup,
  couple: MdFavorite,
  family: MdDiversity3,
  pet: MdPets,
};

const inputClassName =
  'bg-white border-gray-2 text-black placeholder:text-gray-4 focus:border-main-5 w-full rounded-[12px] border p-[20px] text-[16px] font-medium outline-none';

interface CourseBasicInfoDesktopFormProps {
  onNext: (values: CourseBasicInfoValues) => void | Promise<void>;
  defaultValues?: Partial<CourseBasicInfoValues>;
}

function CourseBasicInfoDesktopForm({
  onNext,
  defaultValues,
}: CourseBasicInfoDesktopFormProps) {
  const {
    form: {
      register,
      control,
      formState: { isSubmitting, errors },
    },
    submit,
    invalidSubmitCount,
  } = useCourseBasicInfoForm({ onNext, defaultValues });

  return (
    <form onSubmit={submit} className="flex flex-col gap-[60px]">
      <div className="flex flex-col gap-[40px]">
        <FormField id="course-name" label="코스의 이름을 알려주세요">
          <input
            {...register('courseName')}
            id="course-name"
            type="text"
            placeholder="예) 부산 감성 바다 여행 코스"
            className={inputClassName}
          />
        </FormField>

        <FormField id="course-summary" label="코스를 한마디로 소개해주세요">
          <input
            {...register('summary')}
            id="course-summary"
            type="text"
            placeholder="다른 여행자에게 전하고 싶은 한마디를 적어보세요"
            className={inputClassName}
          />
        </FormField>

        <FormField id="course-duration" label="얼마 동안 즐기는 코스인가요?">
          <Controller
            control={control}
            name="duration"
            render={({ field }) => (
              <DurationSelect value={field.value} onChange={field.onChange} />
            )}
          />
        </FormField>

        <div>
          <Controller
            control={control}
            name="visitStartMonth"
            render={({ field: startField }) => (
              <Controller
                control={control}
                name="visitEndMonth"
                render={({ field: endField }) => (
                  <VisitMonthRange
                    startValue={startField.value}
                    endValue={endField.value}
                    onStartChange={startField.onChange}
                    onEndChange={endField.onChange}
                  />
                )}
              />
            )}
          />
          {errors.visitEndMonth?.type === 'custom' ? (
            <p
              key={invalidSubmitCount}
              className="text-main-5 animate-blink-alert mt-[8px] text-[16px]"
              role="alert"
            >
              {errors.visitEndMonth.message}
            </p>
          ) : null}
        </div>

        <Controller
          control={control}
          name="transport"
          render={({ field }) => (
            <fieldset>
              <legend className="mb-[20px] text-[20px] font-semibold text-black">
                어떻게 이동하는 코스인가요?
              </legend>
              <div className="flex gap-[20px]">
                {transportOptions.map((option) => {
                  const Icon = transportIcons[option.value];
                  const selected = field.value === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => field.onChange(option.value)}
                      style={{ height: TRANSPORT_CARD_HEIGHT }}
                      className={`flex flex-1 flex-col items-center justify-center gap-[20px] rounded-[12px] border ${
                        selected
                          ? 'border-main-5 bg-main-2 text-main-5'
                          : 'border-gray-2 bg-white'
                      }`}
                    >
                      <Icon
                        aria-hidden="true"
                        style={{ fontSize: TRANSPORT_ICON_SIZE }}
                      />
                      <span className="flex flex-col items-center gap-[8px]">
                        <span
                          className={`text-[20px] font-semibold ${
                            selected ? '' : 'text-gray-5'
                          }`}
                        >
                          {option.label}
                        </span>
                        <span
                          className={`text-[16px] font-medium ${
                            selected ? '' : 'text-gray-4'
                          }`}
                        >
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
        />

        <Controller
          control={control}
          name="companion"
          render={({ field }) => (
            <fieldset>
              <legend className="mb-[20px] text-[20px] font-semibold text-black">
                누구와 함께 즐기기 좋은 코스인가요?
              </legend>
              <div className="flex gap-[20px]">
                {companionOptions.map((option) => {
                  const Icon = companionIcons[option.value];
                  const selected = field.value === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => field.onChange(option.value)}
                      style={{ height: COMPANION_CARD_HEIGHT }}
                      className={`flex flex-1 flex-col items-center justify-center gap-[8px] rounded-[12px] border ${
                        selected
                          ? 'border-main-5 bg-main-2 text-main-5'
                          : 'border-gray-2 text-gray-5 bg-white'
                      }`}
                    >
                      <Icon
                        aria-hidden="true"
                        style={{ fontSize: COMPANION_ICON_SIZE }}
                      />
                      <span className="text-[16px] font-medium">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-main-5 disabled:bg-gray-2 disabled:text-gray-4 w-full rounded-[12px] py-[16px] text-[24px] font-semibold text-white disabled:cursor-not-allowed"
      >
        사진 추가하기
      </button>
    </form>
  );
}

export default CourseBasicInfoDesktopForm;
