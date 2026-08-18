import { useState } from 'react';
import type { ComponentType, FormEvent, ReactNode, SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';

import type { NormalizedApiError } from '../../../../apis/common';
import { completeSocialSignup } from '../../../../apis/auth.api';
import { BackButton, ClearableInput } from '../../../../components/auth';
import { Logo } from '../../../../components/common';
import { BIRTH_YEARS } from '../../../../constants/birthYears';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';
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

// Figma 390 디자인 기준 리터럴 px. detail 페이지/SignupStart와 같은 방식으로
// useGlobalScale() 배율을 곱해서 쓴다. line-height는 비율(unitless)로 둔
// 곳은 font-size에 따라 자동으로 같이 스케일되므로 별도 계산이 필요 없다.
const FALLBACK_PAGE_PADDING_X = 24;
const FALLBACK_TEXT_FONT_SIZE = 14;
const FALLBACK_TEXT_LINE_HEIGHT = 20;
const FALLBACK_BUTTON_MARGIN_TOP = 16;
const FALLBACK_BUTTON_FONT_SIZE = 14;

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;

const LOGO_MARGIN_BOTTOM = 32;

const TITLE_FONT_SIZE = 28;

const DESCRIPTION_MARGIN_TOP = 16;
const DESCRIPTION_FONT_SIZE = 16;

const BADGE_MARGIN_TOP = 32;
const BADGE_RADIUS = 12;
const BADGE_PADDING_TOP = 18;
const BADGE_PADDING_RIGHT = 32;
const BADGE_PADDING_BOTTOM = 17;
const BADGE_PADDING_LEFT = 32;
const BADGE_GAP = 20;
const BADGE_ICON_SIZE = 24;
const BADGE_LABEL_FONT_SIZE = 16;
const BADGE_SUBLABEL_MARGIN_TOP = 4;
const BADGE_SUBLABEL_FONT_SIZE = 13;

const FIELDS_MARGIN_TOP = 32;
const FIELDS_GAP = 16;

const FIELD_LABEL_MARGIN_BOTTOM = 8;
const FIELD_LABEL_FONT_SIZE = 16;

const INPUT_HEIGHT = 48;
const INPUT_RADIUS = 12;
const INPUT_PADDING_X = 16;
const INPUT_FONT_SIZE = 14;

const SUBMIT_ERROR_MARGIN_TOP = 16;
const SUBMIT_ERROR_FONT_SIZE = 12;
const SUBMIT_ERROR_LINE_HEIGHT = 16;

const SUBMIT_MARGIN_TOP = 32;
const SUBMIT_HEIGHT = 48;
const SUBMIT_RADIUS = 12;
const SUBMIT_FONT_SIZE = 15;

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
  const scale = useGlobalScale();
  const s = (value: number) => value * scale;
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
        <section
          className="mx-auto flex min-h-dvh w-full max-w-[500px] flex-col items-center justify-center text-center"
          style={{
            paddingLeft: s(FALLBACK_PAGE_PADDING_X),
            paddingRight: s(FALLBACK_PAGE_PADDING_X),
          }}
        >
          <p
            className="font-medium text-gray-4"
            style={{
              fontSize: s(FALLBACK_TEXT_FONT_SIZE),
              lineHeight: `${s(FALLBACK_TEXT_LINE_HEIGHT)}px`,
            }}
          >
            잘못된 접근입니다. 로그인 화면에서 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-bold text-main-5"
            style={{
              marginTop: s(FALLBACK_BUTTON_MARGIN_TOP),
              fontSize: s(FALLBACK_BUTTON_FONT_SIZE),
            }}
          >
            로그인으로 이동
          </button>
        </section>
      </main>
    );
  }

  const inputStyle = {
    height: s(INPUT_HEIGHT),
    borderRadius: s(INPUT_RADIUS),
    paddingLeft: s(INPUT_PADDING_X),
    paddingRight: s(INPUT_PADDING_X),
    fontSize: s(INPUT_FONT_SIZE),
  };

  return (
    <main className="min-h-dvh bg-white">
      <section
        className="mx-auto flex min-h-dvh w-full max-w-[500px] flex-col"
        style={{
          paddingLeft: s(PAGE_PADDING_X),
          paddingRight: s(PAGE_PADDING_X),
          paddingTop: s(PAGE_PADDING_TOP),
          paddingBottom: s(PAGE_PADDING_BOTTOM),
        }}
      >
        <form className="flex-1" onSubmit={handleSubmit}>
          <BackButton onClick={() => navigate('/signup')} />

          <div
            className="flex justify-start"
            style={{ marginBottom: s(LOGO_MARGIN_BOTTOM) }}
          >
            <Logo />
          </div>

          <h1
            className="font-bold text-black"
            style={{ fontSize: s(TITLE_FONT_SIZE), lineHeight: 1.25 }}
          >
            프로필을
            <br />
            완성해 주세요
          </h1>

          <p
            className="font-medium text-gray-4"
            style={{
              marginTop: s(DESCRIPTION_MARGIN_TOP),
              fontSize: s(DESCRIPTION_FONT_SIZE),
              lineHeight: 1.4,
            }}
          >
            더 좋은 여행을 위해 정보를 입력해 주세요
          </p>

          <div
            className={`w-full ${badgeClassName}`}
            style={{
              marginTop: s(BADGE_MARGIN_TOP),
              borderRadius: s(BADGE_RADIUS),
              paddingTop: s(BADGE_PADDING_TOP),
              paddingRight: s(BADGE_PADDING_RIGHT),
              paddingBottom: s(BADGE_PADDING_BOTTOM),
              paddingLeft: s(BADGE_PADDING_LEFT),
            }}
          >
            <div className="flex items-center" style={{ gap: s(BADGE_GAP) }}>
              <Icon
                width={s(BADGE_ICON_SIZE)}
                height={s(BADGE_ICON_SIZE)}
                className="shrink-0"
                aria-hidden="true"
              />

              <div>
                <p
                  className="font-bold"
                  style={{
                    fontSize: s(BADGE_LABEL_FONT_SIZE),
                    lineHeight: 1.35,
                  }}
                >
                  {providerLabel} 계정으로 시작했어요
                </p>
                <p
                  className="font-medium"
                  style={{
                    marginTop: s(BADGE_SUBLABEL_MARGIN_TOP),
                    fontSize: s(BADGE_SUBLABEL_FONT_SIZE),
                    lineHeight: 1.4,
                  }}
                >
                  이제 여행을 위한 정보를 입력해 주세요
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col"
            style={{ marginTop: s(FIELDS_MARGIN_TOP), gap: s(FIELDS_GAP) }}
          >
            <Field label="이름" htmlFor="social-signup-name">
              <ClearableInput
                id="social-signup-name"
                type="text"
                placeholder="이름"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="border-gray-2 placeholder:text-gray-3 focus:border-main-5 block w-full border bg-white outline-none"
                style={inputStyle}
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
            <p
              className="text-center font-medium text-main-5"
              style={{
                marginTop: s(SUBMIT_ERROR_MARGIN_TOP),
                fontSize: s(SUBMIT_ERROR_FONT_SIZE),
                lineHeight: `${s(SUBMIT_ERROR_LINE_HEIGHT)}px`,
              }}
            >
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={!isFormComplete || isSubmitting}
            className="w-full disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-3 enabled:bg-main-5 font-bold enabled:text-white"
            style={{
              marginTop: s(SUBMIT_MARGIN_TOP),
              height: s(SUBMIT_HEIGHT),
              borderRadius: s(SUBMIT_RADIUS),
              fontSize: s(SUBMIT_FONT_SIZE),
            }}
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
  const scale = useGlobalScale();
  const s = (value: number) => value * scale;

  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block font-bold leading-none text-black"
        style={{
          marginBottom: s(FIELD_LABEL_MARGIN_BOTTOM),
          fontSize: s(FIELD_LABEL_FONT_SIZE),
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default SocialProfileForm;
