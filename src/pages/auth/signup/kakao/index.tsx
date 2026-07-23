import { useState } from 'react';

import { KakaoIcon } from '../../../../components/auth';
import { Logo } from '../../../../components/common';

const regions = ['서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주'];
const genders = ['여성', '남성', '선택 안 함'];

function KakaoSignupPage() {
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [gender, setGender] = useState('');
  const [birthYear, setBirthYear] = useState('');

  const isFormComplete =
    name.trim().length > 0 &&
    region.trim().length > 0 &&
    gender.trim().length > 0 &&
    birthYear.trim().length > 0;

  return (
    <main className="min-h-dvh bg-white">
      <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px]">
        <form
          className="flex-1"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="mb-8 flex justify-start">
            <Logo />
          </div>

          <h1 className="text-[28px] font-bold leading-[1.25] text-black">
            프로필을
            <br />
            완성해 주세요
          </h1>

          <p className="mt-4 text-[16px] font-medium leading-[1.4] text-gray-4">
            더 좋은 여행을 위해 정보를 입력해 주세요
          </p>

          <div className="mt-8 w-full rounded-[12px] bg-[#FEE500] pt-4.5 pr-21.25 pb-4.25 pl-8">
            <div className="flex items-center gap-5">
              <KakaoIcon
                width={24}
                height={24}
                className="shrink-0 text-black"
                aria-hidden="true"
              />

              <div>
                <p className="text-[16px] font-bold leading-[1.35] text-black">
                  카카오 계정으로 시작했어요
                </p>
                <p className="mt-1 text-[13px] font-medium leading-[1.4] text-black">
                  이제 여행을 위한 정보를 입력해 주세요
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Field label="이름" htmlFor="kakao-name">
              <input
                id="kakao-name"
                type="text"
                placeholder="이름"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="block h-12 w-full rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 focus:border-main-5"
              />
            </Field>

            <Field label="사는 지역" htmlFor="kakao-region">
              <SelectField>
                <select
                  id="kakao-region"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  className="block h-12 w-full appearance-none rounded-[12px] border border-gray-2 bg-white px-4 pr-11 text-sm text-gray-4 outline-none focus:border-main-5"
                >
                  <option value="">거주 중인 지역을 선택해 주세요</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </SelectField>
            </Field>

            <Field label="성별" htmlFor="kakao-gender">
              <SelectField>
                <select
                  id="kakao-gender"
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  className="block h-12 w-full appearance-none rounded-[12px] border border-gray-2 bg-white px-4 pr-11 text-sm text-gray-4 outline-none focus:border-main-5"
                >
                  <option value="">성별을 선택해 주세요</option>
                  {genders.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </SelectField>
            </Field>

            <Field label="태어난 연도" htmlFor="kakao-birth-year">
              <SelectField>
                <select
                  id="kakao-birth-year"
                  value={birthYear}
                  onChange={(event) => setBirthYear(event.target.value)}
                  className="block h-12 w-full appearance-none rounded-[12px] border border-gray-2 bg-white px-4 pr-11 text-sm text-gray-4 outline-none focus:border-main-5"
                >
                  <option value="">태어난 연도를 선택해 주세요</option>
                  {Array.from({ length: 80 }, (_, index) => {
                    const year = String(new Date().getFullYear() - index);

                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </SelectField>
            </Field>
          </div>

          <button
            type="submit"
            disabled={!isFormComplete}
            className="mt-8 h-12 w-full rounded-[12px] text-[15px] font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-3 enabled:bg-main-5 enabled:text-white"
          >
            여기도 시작하기
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-[16px] font-bold leading-none text-black"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectField({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}

      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-4"
        fill="none"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default KakaoSignupPage;
