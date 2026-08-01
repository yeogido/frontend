import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useGlobalScale } from '../../../../hooks/useGlobalScale';

import { courseBasicInfoSchema, type CourseBasicInfoValues } from '../schema';
import CompanionSelector from './CompanionSelector';
import DurationSelect from './DurationSelect';
import FormField from './FormField';
import TransportSelector from './TransportSelector';
import VisitMonthRange from './VisitMonthRange';

// Figma 390 디자인 기준 리터럴 px
const FORM_MARGIN_TOP = 32;
const FIELD_GAP = 32;
const INPUT_HEIGHT = 48;
const INPUT_PADDING_X = 16;
const INPUT_FONT_SIZE = 14;
const LARGE_BORDER_RADIUS = 12;
const SUBMIT_MARGIN_TOP = 40;
const SUBMIT_HEIGHT = 52;
const SUBMIT_FONT_SIZE = 16;

interface CourseBasicInfoFormProps {
  onNext: (values: CourseBasicInfoValues) => void | Promise<void>;
  defaultValues?: Partial<CourseBasicInfoValues>;
}

function CourseBasicInfoForm({
  onNext,
  defaultValues,
}: CourseBasicInfoFormProps) {
  const scale = useGlobalScale();

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<CourseBasicInfoValues>({
    resolver: zodResolver(courseBasicInfoSchema),
    mode: 'onChange',
    defaultValues: {
      courseName: '',
      summary: '',
      transport: 'walking',
      companion: 'solo',
      ...defaultValues,
    },
  });

  const inputHeight = Math.max(44, INPUT_HEIGHT * scale);
  const submitHeight = Math.max(44, SUBMIT_HEIGHT * scale);

  const inputStyle = {
    height: inputHeight,
    paddingLeft: INPUT_PADDING_X * scale,
    paddingRight: INPUT_PADDING_X * scale,
    fontSize: INPUT_FONT_SIZE * scale,
    borderRadius: LARGE_BORDER_RADIUS * scale,
  };

  return (
    <form
      onSubmit={handleSubmit(onNext)}
      style={{ marginTop: FORM_MARGIN_TOP * scale }}
    >
      <div className="flex flex-col" style={{ gap: FIELD_GAP * scale }}>
        <FormField id="course-name" label="코스의 이름을 알려주세요">
          <input
            {...register('courseName')}
            id="course-name"
            type="text"
            placeholder="예) 부산 감성 바다 여행 코스"
            className="border-gray-2 placeholder:text-gray-4 focus:border-main-5 w-full border bg-white outline-none"
            style={inputStyle}
          />
        </FormField>

        <FormField id="course-summary" label="코스를 한마디로 소개해주세요">
          <input
            {...register('summary')}
            id="course-summary"
            type="text"
            placeholder="다른 여행자에게 전하고 싶은 한마디를 적어보세요"
            className="border-gray-2 placeholder:text-gray-4 focus:border-main-5 w-full border bg-white outline-none"
            style={inputStyle}
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

        <Controller
          control={control}
          name="transport"
          render={({ field }) => (
            <TransportSelector value={field.value} onChange={field.onChange} />
          )}
        />

        <Controller
          control={control}
          name="companion"
          render={({ field }) => (
            <CompanionSelector value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 w-full font-semibold disabled:cursor-not-allowed"
        style={{
          marginTop: SUBMIT_MARGIN_TOP * scale,
          height: submitHeight,
          fontSize: SUBMIT_FONT_SIZE * scale,
          borderRadius: LARGE_BORDER_RADIUS * scale,
        }}
      >
        사진 추가하기
      </button>
    </form>
  );
}

export default CourseBasicInfoForm;
