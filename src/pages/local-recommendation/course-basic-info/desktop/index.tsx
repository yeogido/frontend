import { DesktopPageShell } from '../../../../components/layout/desktop';

import { useCourseBasicInfoPage } from '../useCourseBasicInfoPage';
import CourseBasicInfoDesktopForm from './CourseBasicInfoDesktopForm';

/**
 * 코스 기본 정보 입력 — 데스크톱 뷰(Figma 6360:38445).
 * 모바일 뷰와 스토어 연결·검증은 공유하고 생김새만 다르다.
 */
function CourseBasicInfoDesktopPage() {
  const { defaultValues, handleNext } = useCourseBasicInfoPage();

  return (
    <DesktopPageShell>
      <header className="mb-[60px] flex flex-col gap-[6px]">
        <h1 className="text-[32px] font-semibold text-black">
          어떤 코스인가요?
        </h1>
        <p className="text-gray-5 text-[20px] leading-[1.5] font-medium">
          코스의 기본 정보를 입력해주세요
        </p>
      </header>

      <CourseBasicInfoDesktopForm
        onNext={handleNext}
        defaultValues={defaultValues}
      />
    </DesktopPageShell>
  );
}

export default CourseBasicInfoDesktopPage;
