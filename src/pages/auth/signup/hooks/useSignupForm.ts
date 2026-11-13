import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { getApiErrorMessage } from '../../../../apis/common';
import {
  checkEmail,
  sendEmailCode,
  signup,
  verifyEmailCode,
} from '../../../../apis/auth.api';
import { useRegions } from '../../../../hooks/useRegions';
import type { SignupGender } from '../../../../types/auth.type';
import {
  signupSchema,
  SIGNUP_EMAIL_PATTERN,
  type SignupFormValues,
} from '../schema';

export const SIGNUP_GENDERS: { label: string; value: SignupGender }[] = [
  { label: '여성', value: 'FEMALE' },
  { label: '남성', value: 'MALE' },
  { label: '선택 안 함', value: 'NONE' },
];

const DEFAULT_SIGNUP_ERROR_MESSAGE =
  '회원가입에 실패했습니다. 다시 시도해 주세요.';
const EMAIL_CHECK_ERROR_MESSAGE =
  '이메일 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
const SEND_CODE_ERROR_MESSAGE =
  '인증번호 전송에 실패했습니다. 다시 시도해 주세요.';
const SEND_CODE_SUCCESS_MESSAGE =
  '인증번호를 전송했어요. 5분 이내에 입력해 주세요.';
const VERIFY_CODE_ERROR_MESSAGE =
  '인증번호가 올바르지 않습니다. 다시 확인해 주세요.';
const VERIFY_CODE_SUCCESS_MESSAGE = '이메일 인증이 완료됐어요.';

type EmailCheckStatus = 'idle' | 'checking' | 'available' | 'unavailable';
type EmailAuthStatus =
  'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error';

/**
 * 이메일 회원가입 폼의 상태·검증·API 동작. 모바일과 데스크톱 뷰가 같이 쓴다.
 */
export function useSignupForm() {
  const navigate = useNavigate();
  const { data: regionsData } = useRegions();
  const [emailCheck, setEmailCheck] = useState<{
    status: EmailCheckStatus;
    message: string;
  }>({ status: 'idle', message: '' });
  const [emailAuth, setEmailAuth] = useState<{
    status: EmailAuthStatus;
    message: string;
    token: string | null;
  }>({ status: 'idle', message: '', token: null });
  const [authCode, setAuthCode] = useState('');
  const [submitError, setSubmitError] = useState('');
  // 이메일이 바뀌거나 새 확인 요청이 시작되면 증가시켜, 응답이 늦게 온
  // 이전 요청이 이후 상태를 덮어쓰지 않도록 막는다.
  const emailCheckRequestIdRef = useRef(0);
  // 이메일이 바뀌거나 인증번호 전송·검증이 새로 시작되면 증가시켜, 늦게 온
  // 이전 응답이 새 이메일의 인증 상태와 토큰을 덮어쓰지 못하게 한다.
  const emailAuthRequestIdRef = useRef(0);

  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      regionId: '',
      gender: '',
      birthYear: '',
    },
  });

  const email = useWatch({ control, name: 'email' });
  const isEmailValid = SIGNUP_EMAIL_PATTERN.test(email.trim());

  // 진행 중인 확인 요청이 있다면 이 시점에 무효화해, 나중에 응답이 와도
  // 이미 바뀐 이메일의 상태를 덮어쓰지 못하게 한다. 이메일 자체가
  // 바뀌었으니 인증 상태(emailVerificationToken 포함)도 초기화해서
  // 재인증을 요구한다.
  const handleEmailChange = () => {
    emailCheckRequestIdRef.current += 1;
    emailAuthRequestIdRef.current += 1;
    setEmailCheck({ status: 'idle', message: '' });
    setEmailAuth({ status: 'idle', message: '', token: null });
    setAuthCode('');
  };

  const handleEmailBlur = async () => {
    if (!isEmailValid) {
      return;
    }

    const requestId = ++emailCheckRequestIdRef.current;
    setEmailCheck({ status: 'checking', message: '이메일 확인 중...' });

    try {
      const { isAvailable } = await checkEmail(email.trim());

      // 응답을 받은 사이 이메일이 바뀌어 더 최신 요청이 시작됐다면
      // (또는 onChange로 무효화됐다면) 이 응답은 버린다.
      if (emailCheckRequestIdRef.current !== requestId) {
        return;
      }

      setEmailCheck({
        status: isAvailable ? 'available' : 'unavailable',
        message: isAvailable
          ? '사용 가능한 이메일이에요.'
          : '이미 가입된 이메일이에요.',
      });
    } catch (error) {
      if (emailCheckRequestIdRef.current !== requestId) {
        return;
      }

      setEmailCheck({
        status: 'idle',
        message: getApiErrorMessage(error, EMAIL_CHECK_ERROR_MESSAGE),
      });
    }
  };

  // 이미 "이미 가입된 이메일"임을 알고 있으면 인증번호 전송 자체를
  // 막는다. 다만 이메일 입력 후 바로 옆 전송 버튼을 클릭하면 그 클릭이
  // blur를 먼저 유발해 check-email 응답이 오기 전에 전송이 나갈 수도
  // 있다 — 그 경우는 최종 signup() 시점에 USER4091로 걸러진다.
  const canSendCode =
    isEmailValid &&
    emailCheck.status !== 'unavailable' &&
    emailAuth.status !== 'sending' &&
    emailAuth.status !== 'verifying' &&
    emailAuth.status !== 'verified';
  const canEnterCode =
    emailAuth.status === 'sent' || emailAuth.status === 'error';
  const canVerifyCode = canEnterCode && authCode.trim().length > 0;

  const handleSendCode = async () => {
    if (!canSendCode) {
      return;
    }

    // 재전송 시 이전 인증번호는 서버에서 무효화되므로, 입력창도 함께
    // 비워 사용자가 옛 번호를 다시 입력하지 않게 한다.
    setAuthCode('');
    const requestId = ++emailAuthRequestIdRef.current;
    setEmailAuth({ status: 'sending', message: '', token: null });

    try {
      await sendEmailCode(email.trim());

      if (emailAuthRequestIdRef.current !== requestId) {
        return;
      }

      setEmailAuth({
        status: 'sent',
        message: SEND_CODE_SUCCESS_MESSAGE,
        token: null,
      });
    } catch (error) {
      if (emailAuthRequestIdRef.current !== requestId) {
        return;
      }

      setEmailAuth({
        status: 'error',
        message: getApiErrorMessage(error, SEND_CODE_ERROR_MESSAGE),
        token: null,
      });
    }
  };

  const handleVerifyCode = async () => {
    if (!canVerifyCode) {
      return;
    }

    const requestId = ++emailAuthRequestIdRef.current;
    setEmailAuth((prev) => ({ ...prev, status: 'verifying', message: '' }));

    try {
      const { emailVerificationToken } = await verifyEmailCode(
        email.trim(),
        authCode.trim()
      );

      if (emailAuthRequestIdRef.current !== requestId) {
        return;
      }

      setEmailAuth({
        status: 'verified',
        message: VERIFY_CODE_SUCCESS_MESSAGE,
        token: emailVerificationToken,
      });
    } catch (error) {
      if (emailAuthRequestIdRef.current !== requestId) {
        return;
      }

      // 인증번호 입력은 그대로 남겨 재입력을 유도한다(입력창을 비우지 않음).
      setEmailAuth({
        status: 'error',
        message: getApiErrorMessage(error, VERIFY_CODE_ERROR_MESSAGE),
        token: null,
      });
    }
  };

  const onSubmit = async (values: SignupFormValues) => {
    if (!emailAuth.token) {
      return;
    }

    setSubmitError('');

    try {
      await signup({
        email: values.email.trim(),
        password: values.password,
        nickname: values.name.trim(),
        gender: values.gender as SignupGender,
        birthYear: values.birthYear,
        regionId: Number(values.regionId),
        emailVerificationToken: emailAuth.token,
      });

      navigate('/login', {
        state: { signupCompleted: true, email: values.email.trim() },
      });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, DEFAULT_SIGNUP_ERROR_MESSAGE));
    }
  };

  return {
    register,
    control,
    handleSubmit,
    errors,
    isValid,
    isSubmitting,
    regionsData,
    emailCheck,
    emailAuth,
    authCode,
    setAuthCode,
    submitError,
    canSendCode,
    canEnterCode,
    canVerifyCode,
    handleEmailChange,
    handleEmailBlur,
    handleSendCode,
    handleVerifyCode,
    onSubmit,
  };
}
