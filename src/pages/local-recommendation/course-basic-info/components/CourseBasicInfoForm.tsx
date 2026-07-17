import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { courseBasicInfoSchema, type CourseBasicInfoValues } from '../schema';
import CompanionSelector from './CompanionSelector';
import DurationSelect from './DurationSelect';
import FormField from './FormField';
import TransportSelector from './TransportSelector';
import VisitMonthRange from './VisitMonthRange';

interface CourseBasicInfoFormProps {
  onNext: (values: CourseBasicInfoValues) => void | Promise<void>;
}

function CourseBasicInfoForm({ onNext }: CourseBasicInfoFormProps) {
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
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="mt-8">
      <div className="space-y-8">
        <FormField id="course-name" label="코스의 이름을 알려주세요">
          <input
            {...register('courseName')}
            id="course-name"
            type="text"
            placeholder="예) 부산 감성 바다 여행 코스"
            className="border-gray-2 bg-white placeholder:text-gray-4 focus:border-main-5 h-12 w-full rounded-xl border px-4 text-sm outline-none"
          />
        </FormField>

        <FormField id="course-summary" label="코스를 한마디로 소개해주세요">
          <input
            {...register('summary')}
            id="course-summary"
            type="text"
            placeholder="다른 여행자에게 전하고 싶은 한마디를 적어보세요"
            className="border-gray-2 bg-white placeholder:text-gray-4 focus:border-main-5 h-12 w-full rounded-xl border px-4 text-sm outline-none"
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
        className="bg-main-5 text-pure-white disabled:bg-gray-2 disabled:text-gray-4 mt-10 h-13 w-full rounded-xl text-base font-semibold disabled:cursor-not-allowed"
      >
        사진 추가하기
      </button>
    </form>
  );
}

export default CourseBasicInfoForm;
