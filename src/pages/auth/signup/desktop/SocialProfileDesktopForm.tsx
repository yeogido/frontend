import type { ComponentType, SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';

import { ClearableInput } from '../../../../components/auth';
import AuthDesktopField from '../../../../components/auth/desktop/AuthDesktopField';
import AuthDesktopLayout from '../../../../components/auth/desktop/AuthDesktopLayout';
import {
  AUTH_INPUT_CLASS,
  AUTH_SUBMIT_BUTTON_CLASS,
  AUTH_TITLE_CLASS,
} from '../../../../components/auth/desktop/authDesktopStyles';
import { BIRTH_YEARS } from '../../../../constants/birthYears';
import { getFullRegionName } from '../../../../utils/regionName';
import SelectField from '../components/SelectField';
import {
  SOCIAL_GENDERS,
  useSocialProfileForm,
} from '../hooks/useSocialProfileForm';

// Figma 1440 데스크톱 시안(5691:922, 5691:1090) 기준 리터럴 px.
const BADGE_ICON_SIZE = 24;

interface SocialProfileDesktopFormProps {
  readonly providerLabel: string;
  readonly badgeClassName: string;
  readonly Icon: ComponentType<SVGProps<SVGSVGElement>>;
  readonly temporaryToken?: string;
  readonly defaultName?: string;
}

/** 카카오·네이버로 가입한 뒤 프로필을 완성하는 폼. */
function SocialProfileDesktopForm({
  providerLabel,
  badgeClassName,
  Icon,
  temporaryToken,
  defaultName,
}: SocialProfileDesktopFormProps) {
  const navigate = useNavigate();
  const {
    regionsData,
    name,
    setName,
    regionId,
    setRegionId,
    gender,
    setGender,
    birthYear,
    setBirthYear,
    nicknameError,
    isFormComplete,
    isSubmitting,
    submitError,
    handleSubmit,
  } = useSocialProfileForm({ temporaryToken, defaultName });

  if (!temporaryToken) {
    return (
      <AuthDesktopLayout>
        <div className="flex flex-col items-center gap-[16px] py-[48px] text-center">
          <p className="text-gray-4 text-[14px] font-medium">
            잘못된 접근입니다. 로그인 화면에서 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-main-5 cursor-pointer text-[14px] font-semibold"
          >
            로그인으로 이동
          </button>
        </div>
      </AuthDesktopLayout>
    );
  }

  return (
    <AuthDesktopLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-[32px]">
        <div className="flex flex-col gap-[12px]">
          <h1 className={`${AUTH_TITLE_CLASS} leading-[1.2]`}>
            프로필을
            <br />
            완성해 주세요
          </h1>
          <p className="text-gray-5 text-[14px]">
            더 좋은 여행을 위해 정보를 입력해 주세요
          </p>
        </div>

        <div className="flex flex-col gap-[40px]">
          <div className="flex flex-col gap-[24px]">
            <div
              className={`flex items-center gap-[20px] rounded-[12px] px-[32px] py-[18px] ${badgeClassName}`}
            >
              <Icon
                width={BADGE_ICON_SIZE}
                height={BADGE_ICON_SIZE}
                aria-hidden="true"
                className="shrink-0"
              />
              <div className="flex flex-col gap-[4px]">
                <p className="text-[16px] font-semibold">
                  {providerLabel} 계정으로 시작했어요
                </p>
                <p className="text-[12px] font-medium">
                  이제 여행을 위한 정보를 입력해 주세요
                </p>
              </div>
            </div>

            <AuthDesktopField
              id="social-name"
              label="이름"
              error={nicknameError ?? undefined}
            >
              <ClearableInput
                id="social-name"
                type="text"
                placeholder="이름"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={AUTH_INPUT_CLASS}
              />
            </AuthDesktopField>

            <AuthDesktopField id="social-region" label="사는 지역">
              <SelectField
                id="social-region"
                ariaLabel="사는 지역"
                compact
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
            </AuthDesktopField>

            <AuthDesktopField id="social-gender" label="성별">
              <SelectField
                id="social-gender"
                ariaLabel="성별"
                compact
                value={gender}
                onChange={setGender}
                options={[
                  { value: '', label: '성별을 선택해 주세요' },
                  ...SOCIAL_GENDERS.map((genderOption) => ({
                    value: genderOption.value,
                    label: genderOption.label,
                  })),
                ]}
              />
            </AuthDesktopField>

            <AuthDesktopField id="social-birth-year" label="태어난 연도">
              <SelectField
                id="social-birth-year"
                ariaLabel="태어난 연도"
                compact
                value={birthYear}
                onChange={setBirthYear}
                options={[
                  { value: '', label: '태어난 연도를 선택해 주세요' },
                  ...BIRTH_YEARS.map((year) => ({ value: year, label: year })),
                ]}
              />
            </AuthDesktopField>
          </div>

          <div className="flex flex-col gap-[16px]">
            {submitError ? (
              <p
                role="alert"
                className="text-main-5 text-center text-[12px] font-medium"
              >
                {submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!isFormComplete || isSubmitting}
              className={AUTH_SUBMIT_BUTTON_CLASS}
            >
              {isSubmitting ? '가입 처리 중...' : '여기도 시작하기'}
            </button>
          </div>
        </div>
      </form>
    </AuthDesktopLayout>
  );
}

export default SocialProfileDesktopForm;
