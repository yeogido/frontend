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
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [region, setRegion] = useState('');
  const [gender, setGender] = useState('');
  const [birthYear, setBirthYear] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isCodeFilled = code.trim().length > 0;
  const isPasswordFilled = password.trim().length > 0;
  const isPasswordConfirmFilled = passwordConfirm.trim().length > 0;
  const isPasswordMatched =
    isPasswordFilled && isPasswordConfirmFilled && password === passwordConfirm;
  const isNameFilled = name.trim().length > 0;
  const isRegionFilled = region.trim().length > 0;
  const isGenderFilled = gender.trim().length > 0;
  const isBirthYearFilled = birthYear.trim().length > 0;

  const isFormComplete =
    isNameFilled &&
    isEmailValid &&
    isCodeFilled &&
    isPasswordMatched &&
    isRegionFilled &&
    isGenderFilled &&
    isBirthYearFilled;

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px] sm:px-8 sm:pt-24">
      <div className="flex-1">
        <h1 className="text-[28px] font-bold leading-none text-[#1C1C1C] sm:text-[32px]">
          회원가입
        </h1>

        <p className="mt-3 text-xs font-medium text-[#7F7F7F]">
          여기도를 시작하기 위해 필요한 정보예요
        </p>

        <div className="mt-9 space-y-4">
          <Field
            id="signup-name"
            label="이름"
          >
              <input
                id="signup-name"
                type="text"
                placeholder="이름"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="block h-12 w-full rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
              />
          </Field>

          <SectionField
            label="이메일"
            htmlFor="signup-email"
          >
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  id="signup-email"
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setIsCodeSent(false);
                    setCode('');
                  }}
                  className="block h-12 min-w-0 flex-1 rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (!isEmailValid) {
                      return;
                    }

                    setIsCodeSent(true);
                  }}
                  disabled={!isEmailValid}
                  className="h-12 w-[82px] shrink-0 cursor-pointer rounded-[12px] text-xs font-bold disabled:cursor-not-allowed disabled:bg-[#E4E4E4] disabled:text-[#7F7F7F] enabled:bg-[#FF6B4A] enabled:text-white"
                >
                  인증번호 전송
                </button>
              </div>

              {isCodeSent && (
                <div className="flex gap-2">
                  <label
                    htmlFor="signup-code"
                    className="sr-only"
                  >
                    인증번호
                  </label>
                  <input
                    id="signup-code"
                    type="text"
                    placeholder="인증번호"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="block h-12 min-w-0 flex-1 rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
                  />

                  <button
                    type="button"
                    disabled={!isCodeFilled}
<<<<<<< HEAD
                    className="h-12 w-[82px] shrink-0 cursor-pointer rounded-[12px] bg-[#E4E4E4] text-xs font-bold text-[#7F7F7F] disabled:cursor-not-allowed disabled:bg-[#E4E4E4] disabled:text-[#7F7F7F] enabled:bg-[#FF6B4A] enabled:text-white"
=======
                    className="h-12 w-[82px] shrink-0 rounded-[12px] bg-[#E4E4E4] text-xs font-bold text-[#7F7F7F] disabled:cursor-not-allowed disabled:bg-[#E4E4E4] disabled:text-[#7F7F7F] enabled:bg-[#FF6B4A] enabled:text-white"
>>>>>>> origin/develop
                  >
                    인증하기
                  </button>
                </div>
              )}
            </div>
          </SectionField>

          <SectionField
            label="비밀번호"
            htmlFor="signup-password"
          >
            <div className="space-y-2">
              <input
                id="signup-password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="block h-12 w-full rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
              />

              <input
                id="signup-password-confirm"
                type="password"
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                className="block h-12 w-full rounded-[12px] border border-[#E8E8E8] bg-white px-4 text-sm outline-none placeholder:text-[#A1A1A1] focus:border-[#FF6B4A]"
              />
              <label
                htmlFor="signup-password-confirm"
                className="sr-only"
              >
                비밀번호 확인
              </label>
            </div>
          </SectionField>

          <Field
            id="signup-region"
            label="사는 지역"
          >
            <SelectField>
              <select
                id="signup-region"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="block h-12 w-full appearance-none rounded-[12px] border border-[#E8E8E8] bg-white px-4 pr-11 text-sm text-[#7F7F7F] outline-none focus:border-[#FF6B4A]"
              >
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
            </SelectField>
          </Field>

          <Field
            id="signup-gender"
            label="성별"
          >
            <SelectField>
              <select
                id="signup-gender"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                className="block h-12 w-full appearance-none rounded-[12px] border border-[#E8E8E8] bg-white px-4 pr-11 text-sm text-[#7F7F7F] outline-none focus:border-[#FF6B4A]"
              >
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
            </SelectField>
          </Field>

          <Field
            id="signup-birth-year"
            label="태어난 연도"
          >
            <SelectField>
              <select
                id="signup-birth-year"
                value={birthYear}
                onChange={(event) => setBirthYear(event.target.value)}
                className="block h-12 w-full appearance-none rounded-[12px] border border-[#E8E8E8] bg-white px-4 pr-11 text-sm text-[#7F7F7F] outline-none focus:border-[#FF6B4A]"
              >
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
            </SelectField>
          </Field>
        </div>

        <button
          type="button"
          disabled={!isFormComplete}
<<<<<<< HEAD
          className="mt-8 h-12 w-full cursor-pointer rounded-[12px] text-[15px] font-bold disabled:cursor-not-allowed disabled:bg-[#E4E4E4] disabled:text-[#A1A1A1] enabled:bg-[#FF6B4A] enabled:text-white"
=======
          className="mt-8 h-12 w-full rounded-[12px] text-[15px] font-bold disabled:cursor-not-allowed disabled:bg-[#E4E4E4] disabled:text-[#A1A1A1] enabled:bg-[#FF6B4A] enabled:text-white"
>>>>>>> origin/develop
        >
          여기도 시작하기
        </button>
      </div>
    </section>
  );
}

interface FieldProps {
  id: string;
  label?: string;
  children: ReactNode;
}

function Field({ id, label, children }: FieldProps) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-bold text-[#1C1C1C]"
        >
          {label}
        </label>
      )}

      {children}
    </div>
  );
}

function SectionField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-3 block text-sm font-bold text-[#1C1C1C]"
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function SelectField({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}

      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7F7F7F]"
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

export default SignupForm;
