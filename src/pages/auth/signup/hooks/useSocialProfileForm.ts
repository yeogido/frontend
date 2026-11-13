import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import type { NormalizedApiError } from '../../../../apis/common';
import { completeSocialSignup } from '../../../../apis/auth.api';
import { useRegions } from '../../../../hooks/useRegions';
import { useAuthStore } from '../../../../store/auth.store';
import type { SocialGender } from '../../../../types/auth.type';
import { getNicknameError } from '../../../../utils/nickname';

export const SOCIAL_GENDERS: { label: string; value: SocialGender }[] = [
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

interface UseSocialProfileFormParams {
  temporaryToken?: string;
  defaultName?: string;
}

/**
 * 카카오·네이버 가입의 프로필 완성 폼 동작. 모바일과 데스크톱 뷰가 같이 쓴다.
 */
export function useSocialProfileForm({
  temporaryToken,
  defaultName,
}: UseSocialProfileFormParams) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { data: regionsData } = useRegions();

  const [name, setName] = useState(defaultName ?? '');
  const [regionId, setRegionId] = useState('');
  const [gender, setGender] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const nicknameError = getNicknameError(name);

  const isFormComplete =
    !nicknameError &&
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

  return {
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
  };
}
