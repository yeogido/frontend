import type { ReactNode } from 'react';
import { useState } from 'react';

const regions = [
  '서울',
  '경기',
  '인천',
  '강원',
  '충북',
  '충남',
  '대전',
  '세종',
  '전북',
  '전남',
  '광주',
  '경북',
  '경남',
  '대구',
  '울산',
  '부산',
  '제주',
];

const genders = ['여성', '남성', '선택 안 함'];

const birthYears = Array.from({ length: 80 }, (_, index) =>
  String(new Date().getFullYear() - index)
);

function SignupForm() {
  const [isCodeSent, setIsCodeSent] = useState(false);

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px] sm:px-8 sm:pt-24">
      <div className="flex-1">
        <h1 className="text-[28px] font-bold leading-none text-[#1C1C1C] sm:text-[32px]">
          회원가입
        </h1>

        <p className="mt-3 text-xs font-medium text-[#7F7F7F]">
          여기도를 시작하기 위해 필요한 정보예요
        </p>

        <div className="mt-9 space-y-5">
          <Field label="이름">
            <input
              type="text"
              placeholder="이름"
              className="block h-12 w-full rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
            />
          </Field>

          <Field label="이메일">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="이메일"
                className="block h-12 min-w-0 flex-1 rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
              />

              <button
                type="button"
                onClick={() => setIsCodeSent(true)}
                className="h-12 w-[76px] shrink-0 rounded-[12px] bg-[#E4E4E4] text-xs font-bold text-[#7F7F7F]"
              >
                인증하기
              </button>
            </div>
          </Field>

          {isCodeSent && (
            <Field label="인증번호">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="인증번호"
                  className="block h-12 min-w-0 flex-1 rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
                />

                <button
                  type="button"
                  className="h-12 w-[82px] shrink-0 rounded-[12px] bg-[#FF6B4A] text-[10px] font-bold text-white"
                >
                  인증번호 전송
                </button>
              </div>
            </Field>
          )}

          <Field label="비밀번호">
            <input
              type="password"
              placeholder="비밀번호"
              className="block h-12 w-full rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
            />
          </Field>

          <Field>
            <input
              type="password"
              placeholder="비밀번호 확인"
              className="block h-12 w-full rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
            />
          </Field>

          <Field label="사는 지역">
            <select className="block h-12 w-full appearance-none rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm text-[#7F7F7F] outline-none focus:border-[#FF6B4A]">
              <option value="">거주 중인 지역을 선택해 주세요</option>
              {regions.map((region) => (
                <option
                  key={region}
                  value={region}
                >
                  {region}
                </option>
              ))}
            </select>
          </Field>

          <Field label="성별">
            <select className="block h-12 w-full appearance-none rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm text-[#7F7F7F] outline-none focus:border-[#FF6B4A]">
              <option value="">성별을 선택해 주세요</option>
              {genders.map((gender) => (
                <option
                  key={gender}
                  value={gender}
                >
                  {gender}
                </option>
              ))}
            </select>
          </Field>

          <Field label="태어난 연도">
            <select className="block h-12 w-full appearance-none rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm text-[#7F7F7F] outline-none focus:border-[#FF6B4A]">
              <option value="">태어난 연도를 선택해 주세요</option>
              {birthYears.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <button
          type="button"
          className="mt-8 h-12 w-full rounded-[12px] bg-[#E4E4E4] text-[15px] font-bold text-[#A1A1A1]"
        >
          여기도 시작하기
        </button>
      </div>
    </section>
  );
}

interface FieldProps {
  label?: string;
  children: ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-bold text-[#1C1C1C]">
          {label}
        </label>
      )}

      {children}
    </div>
  );
}

export default SignupForm;
