import { useState } from 'react';
import type { ComponentType, FormEvent, ReactNode, SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';

import type { NormalizedApiError } from '../../../../apis/common';
import { completeSocialSignup } from '../../../../apis/auth.api';
import { BackButton, ClearableInput } from '../../../../components/auth';
import { Logo } from '../../../../components/common';
import { BIRTH_YEARS } from '../../../../constants/birthYears';
import { useRegions } from '../../../../hooks/useRegions';
import { useAuthStore } from '../../../../store/auth.store';
import type { SocialGender } from '../../../../types/auth.type';
import { getFullRegionName } from '../../../../utils/regionName';

import SelectField from './SelectField';

const genders: { label: string; value: SocialGender }[] = [
  { label: '여성', value: 'FEMALE' },
  { label: '남성', value: 'MALE' },
  { label: '선택 안 함', value: 'NONE' },
];

const DEFAULT_ERROR_MESSAGE = '회원가입에 실패했습니다. 다시 시도해 주세요.';

// social-signup/complete API에 실제로 매핑된 에러 코드만 반영.
const SIGNUP_ERROR_MESSAGES: Record<string, string> = {
  COMMON4001: '잘못된 요청입니다.',
  AUTH4003: '인증이 만료되었습니다. 처음부터 다시 시도해 주세요.',
  REGION4041: '선택한 지역을 찾을 수 없습니다.',
  USER4091: '이미 가입된 이메일입니다.',
  AUTH4091: '이미 가입된 소셜 계정입니다.',
};

function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

interface SocialProfileFormProps {
  providerLabel: string;
  badgeClassName: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  temporaryToken?: string;
  defaultName?: string;
}

function SocialProfileForm({
  providerLabel,
  badgeClassName,
  Icon,
  temporaryToken,
  defaultName,
}: SocialProfileFormProps) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { data: regionsData } = useRegions();

  const [name, setName] = useState(defaultName ?? '');
  const [regionId, setRegionId] = useState('');
  const [gender, setGender] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isFormComplete =
    name.trim().length > 0 &&
    regionId.trim().length > 0 &&
    gender.trim().length > 0 &&
    birthYear.trim().length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormComplete || !temporaryToken) {
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const result = await completeSocialSignup({
        temporaryToken,
        name: name.trim(),
        gender: gender as SocialGender,
        birthYear,
        regionId: Number(regionId),
      });

      setAuth(result);
      navigate('/');
    } catch (error) {
      const code = isNormalizedApiError(error) ? error.code : undefined;
      const mappedMessage = code ? SIGNUP_ERROR_MESSAGES[code] : undefined;

      setSubmitError(mappedMessage ?? DEFAULT_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!temporaryToken) {
    return (
      <main className="min-h-dvh bg-white">
        <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-medium text-gray-4">
            잘못된 접근입니다. 로그인 화면에서 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-4 text-sm font-bold text-main-5"
          >
            로그인으로 이동
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-white">
      <section className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-6 pb-10 pt-[56px]">
        <form className="flex-1" onSubmit={handleSubmit}>
          <BackButton onClick={() => navigate('/signup')} />

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

          <div
            className={`mt-8 w-full rounded-[12px] pt-4.5 pr-8 pb-4.25 pl-8 ${badgeClassName}`}
          >
            <div className="flex items-center gap-5">
              <Icon
                width={24}
                height={24}
                className="shrink-0"
                aria-hidden="true"
              />

              <div>
                <p className="text-[16px] font-bold leading-[1.35]">
                  {providerLabel} 계정으로 시작했어요
                </p>
                <p className="mt-1 text-[13px] font-medium leading-[1.4]">
                  이제 여행을 위한 정보를 입력해 주세요
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Field label="이름" htmlFor="social-signup-name">
              <ClearableInput
                id="social-signup-name"
                type="text"
                placeholder="이름"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="block h-12 w-full rounded-[12px] border border-gray-2 bg-white px-4 text-sm outline-none placeholder:text-gray-3 focus:border-main-5"
              />
            </Field>

            <Field label="사는 지역" htmlFor="social-signup-region">
              <SelectField
                id="social-signup-region"
                ariaLabel="사는 지역"
                value={regionId}
                onChange={setRegionId}
                options={[
                  { value: '', label: '거주 중인 지역을 선택해 주세요' },
                  ...(regionsData?.regions ?? []).map((region) => ({
                    value: String(region.regionId),
                    label: getFullRegionName(region.name),
                  })),
                ]}
              />
            </Field>

            <Field label="성별" htmlFor="social-signup-gender">
              <SelectField
                id="social-signup-gender"
                ariaLabel="성별"
                value={gender}
                onChange={setGender}
                options={[
                  { value: '', label: '성별을 선택해 주세요' },
                  ...genders.map((genderOption) => ({
                    value: genderOption.value,
                    label: genderOption.label,
                  })),
                ]}
              />
            </Field>

            <Field label="태어난 연도" htmlFor="social-signup-birth-year">
              <SelectField
                id="social-signup-birth-year"
                ariaLabel="태어난 연도"
                value={birthYear}
                onChange={setBirthYear}
                options={[
                  { value: '', label: '태어난 연도를 선택해 주세요' },
                  ...BIRTH_YEARS.map((year) => ({ value: year, label: year })),
                ]}
              />
            </Field>
          </div>

          {submitError && (
            <p className="mt-4 text-center text-xs font-medium text-main-5">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={!isFormComplete || isSubmitting}
            className="mt-8 h-12 w-full rounded-[12px] text-[15px] font-bold disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-3 enabled:bg-main-5 enabled:text-white"
          >
            {isSubmitting ? '가입 처리 중...' : '여기도 시작하기'}
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
  children: ReactNode;
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

export default SocialProfileForm;
