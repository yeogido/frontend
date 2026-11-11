import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { courseBasicInfoSchema, type CourseBasicInfoValues } from './schema';

interface UseCourseBasicInfoFormOptions {
  onNext: (values: CourseBasicInfoValues) => void | Promise<void>;
  defaultValues?: Partial<CourseBasicInfoValues>;
}

/**
 * 코스 기본 정보 폼의 상태·검증. 모바일과 데스크톱 뷰가 생김새만 다르고
 * 스키마·기본값·제출 처리는 같아서 여기로 모았다.
 *
 * invalidSubmitCount는 검증 실패 메시지를 다시 깜빡이게 하는 key로 쓴다 —
 * 같은 오류가 이어질 때도 애니메이션이 다시 돌아야 사용자가 알아챈다.
 */
export function useCourseBasicInfoForm({
  onNext,
  defaultValues,
}: UseCourseBasicInfoFormOptions) {
  const [invalidSubmitCount, setInvalidSubmitCount] = useState(0);

  const form = useForm<CourseBasicInfoValues>({
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

  const submit = form.handleSubmit(onNext, () =>
    setInvalidSubmitCount((count) => count + 1)
  );

  return { form, submit, invalidSubmitCount };
}
