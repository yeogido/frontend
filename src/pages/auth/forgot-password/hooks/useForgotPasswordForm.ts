import type { KeyboardEvent } from 'react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '../../../../apis/common';
import {
  sendPasswordResetCode,
  verifyPasswordResetCode,
} from '../../../../apis/auth.api';
import { SIGNUP_EMAIL_PATTERN } from '../../signup/schema';

const SEND_CODE_ERROR_MESSAGE =
  '인증번호 전송에 실패했습니다. 다시 시도해 주세요.';
const SEND_CODE_SUCCESS_MESSAGE =
  '인증번호를 전송했어요. 이메일을 확인해 주세요.';
const VERIFY_CODE_ERROR_MESSAGE =
  '인증번호가 올바르지 않습니다. 다시 확인해 주세요.';

// sendError/verifyError를 나눠서, 전송 자체가 실패했을 때는 인증번호
// 입력창을 노출하지 않을 수 있게 한다(hasSentOnce로 판단).
type CodeStatus =
  | 'idle'
  | 'sending'
  | 'sent'
  | 'sendError'
  | 'verifying'
  | 'verified'
  | 'verifyError';

/**
 * 비밀번호 찾기(이메일 인증) 폼의 상태·API 동작. 모바일과 데스크톱 뷰가 같이 쓴다.
 */
export function useForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeAuth, setCodeAuth] = useState<{
    status: CodeStatus;
    message: string;
    resetToken: string | null;
    // 최신 시도가 sendError여도, 이전에 한 번이라도 전송에 성공했다면
    // 인증번호 입력은 계속 노출한다(받은 코드가 아직 유효할 수 있음).
    hasSentOnce: boolean;
  }>({ status: 'idle', message: '', resetToken: null, hasSentOnce: false });
  // 이메일이 바뀌거나 새 전송을 시작할 때 올려서, 이미 날아간 이전 전송
  // 요청의 응답이 늦게 도착해도 무시하게 만든다. 인증번호 입력은 전송
  // 응답과 무관하므로 이 값을 건드리지 않는다 — 재전송 중 인증번호를
  // 고쳐도 sending 상태가 풀리게 하려는 것이다.
  const sendRevisionRef = useRef(0);
  // 이메일·인증번호가 바뀌거나 새 전송·검증을 시작할 때 올려서, 오래된
  // 검증 응답이 현재 입력의 상태를 덮어쓰지 못하게 한다.
  const verifyRevisionRef = useRef(0);

  const isEmailValid = SIGNUP_EMAIL_PATTERN.test(email.trim());
  const isCodeSent = codeAuth.hasSentOnce;
  const isCodeFilled = code.trim().length > 0;
  const canSendCode =
    isEmailValid &&
    codeAuth.status !== 'sending' &&
    codeAuth.status !== 'verifying';
  const canVerifyCode =
    isCodeSent && isCodeFilled && codeAuth.status !== 'verifying';
  const isResetButtonEnabled = codeAuth.status === 'verified';

  const handleEmailChange = (value: string) => {
    sendRevisionRef.current += 1;
    verifyRevisionRef.current += 1;
    setEmail(value);
    setCode('');
    setCodeAuth({
      status: 'idle',
      message: '',
      resetToken: null,
      hasSentOnce: false,
    });
  };

  const handleCodeChange = (value: string) => {
    verifyRevisionRef.current += 1;
    setCode(value);
    setCodeAuth((prev) =>
      prev.status === 'verified' ||
      prev.status === 'verifyError' ||
      prev.status === 'verifying'
        ? { ...prev, status: 'sent', message: '', resetToken: null }
        : prev
    );
  };

  const handleSendCode = async () => {
    if (!canSendCode) {
      return;
    }

    const requestRevision = ++sendRevisionRef.current;
    // 새 인증번호가 나가면 이전 번호의 검증 응답은 더는 유효하지 않다.
    verifyRevisionRef.current += 1;
    setCode('');
    setCodeAuth((prev) => ({
      ...prev,
      status: 'sending',
      message: '',
      resetToken: null,
    }));

    try {
      await sendPasswordResetCode(email.trim());

      if (sendRevisionRef.current !== requestRevision) return;

      setCodeAuth({
        status: 'sent',
        message: SEND_CODE_SUCCESS_MESSAGE,
        resetToken: null,
        hasSentOnce: true,
      });
    } catch (error) {
      if (sendRevisionRef.current !== requestRevision) return;

      setCodeAuth((prev) => ({
        status: 'sendError',
        message: getApiErrorMessage(error, SEND_CODE_ERROR_MESSAGE),
        resetToken: null,
        hasSentOnce: prev.hasSentOnce,
      }));
    }
  };

  const handleVerifyCode = async () => {
    if (!canVerifyCode) {
      return;
    }

    const requestRevision = ++verifyRevisionRef.current;
    setCodeAuth((prev) => ({ ...prev, status: 'verifying', message: '' }));

    try {
      const { resetToken } = await verifyPasswordResetCode(
        email.trim(),
        code.trim()
      );

      if (verifyRevisionRef.current !== requestRevision) return;

      setCodeAuth((prev) => ({
        ...prev,
        status: 'verified',
        message: '',
        resetToken,
      }));
    } catch (error) {
      if (verifyRevisionRef.current !== requestRevision) return;

      // 인증번호 입력은 그대로 남겨 재입력을 유도한다(입력창을 비우지 않음).
      setCodeAuth((prev) => ({
        ...prev,
        status: 'verifyError',
        message: getApiErrorMessage(error, VERIFY_CODE_ERROR_MESSAGE),
        resetToken: null,
      }));
    }
  };

  const handleResetPassword = () => {
    if (!isResetButtonEnabled || !codeAuth.resetToken) {
      return;
    }

    navigate('/forgot-password/reset', {
      state: { email: email.trim(), resetToken: codeAuth.resetToken },
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.tagName === 'BUTTON') {
      return;
    }

    event.preventDefault();

    if (codeAuth.status !== 'verified') {
      if (!isCodeSent) {
        void handleSendCode();
        return;
      }

      void handleVerifyCode();
      return;
    }

    handleResetPassword();
  };

  return {
    email,
    code,
    codeAuth,
    isCodeSent,
    canSendCode,
    canVerifyCode,
    isResetButtonEnabled,
    handleEmailChange,
    handleCodeChange,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    handleKeyDown,
  };
}
