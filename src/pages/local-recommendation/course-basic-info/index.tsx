import { CourseBasicInfoForm } from './components';
import type { CourseBasicInfoValues } from './schema';

function CourseBasicInfoPage() {
  const handleNext = (values: CourseBasicInfoValues) => {
    void values;
  };

  return (
    <main className="bg-pure-white mx-auto min-h-dvh w-full max-w-[430px] px-6 pt-12 pb-8">
      <header>
        <h1 className="text-[32px] leading-[1.15] font-bold">
          어떤
          <br />
          코스인가요?
        </h1>
        <p className="text-gray-4 mt-3 text-sm">
          코스의 기본 정보를 입력해주세요
        </p>
      </header>

      <CourseBasicInfoForm onNext={handleNext} />
    </main>
  );
}

export default CourseBasicInfoPage;
