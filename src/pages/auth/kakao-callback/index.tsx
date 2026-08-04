import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { NormalizedApiError } from '../../../apis/common';
import { socialLogin } from '../../../apis/auth.api';
import { Logo } from '../../../components/common';
import { useAuthStore } from '../../../store/auth.store';

const DEFAULT_ERROR_MESSAGE =
  '카카오 로그인에 실패했습니다. 다시 시도해 주세요.';

// social-login API에 실제로 매핑된 에러 코드만 반영.
const SOCIAL_LOGIN_ERROR_MESSAGES: Record<string, string> = {
  EXT4001: '지원하지 않는 소셜 로그인입니다.',
  AUTH4002:
    '이메일 제공에 동의해야 로그인할 수 있어요. 카카오 로그인 시 이메일 제공에 동의해 주세요.',
  AUTH4011: '유효하지 않은 소셜 인증 정보입니다. 다시 시도해 주세요.',
};

function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

function parseKakaoCallbackParams() {
  const params = new URLSearchParams(window.location.search);

  return { code: params.get('code'), kakaoError: params.get('error') };
}

function KakaoCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  // code/error 파라미터는 최초 진입 시점에 고정이므로, effect에서
  // setState하지 않고 초기 렌더 시점에 lazy initializer로 미리 계산한다.
  const [errorMessage, setErrorMessage] = useState(() => {
    const { code, kakaoError } = parseKakaoCallbackParams();

    if (kakaoError) {
      return '카카오 로그인이 취소되었습니다.';
    }

    return code ? '' : DEFAULT_ERROR_MESSAGE;
  });
  // StrictMode에서 effect가 두 번 실행돼도 인가 코드를 두 번 소모하지
  // 않도록 막는다 (카카오 인가 코드는 1회용).
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current) {
      return;
    }
    hasHandledRef.current = true;

    const { code, kakaoError } = parseKakaoCallbackParams();

    if (kakaoError || !code) {
      return;
    }

    // TODO(백엔드 스펙 확정 대기): social-login이 accessToken 대신 code를
    // 받도록 바뀌는 걸 전제로 한 잠정 구현. 필드명(code/redirectUri)이
    // 확정되면 SocialLoginRequest 타입과 함께 여기도 맞춰야 한다.
    socialLogin({
      provider: 'KAKAO',
      code,
      redirectUri: `${window.location.origin}/auth/kakao/callback`,
    })
      .then((result) => {
        if (result.isNewUser) {
          navigate('/signup/kakao', {
            replace: true,
            state: {
              temporaryToken: result.temporaryToken,
              name: result.name,
            },
          });
          return;
        }

        setAuth({
          userId: result.userId as number,
          accessToken: result.accessToken as string,
          refreshToken: result.refreshToken as string,
        });
        navigate('/', { replace: true });
      })
      .catch((error: unknown) => {
        const errorCode = isNormalizedApiError(error) ? error.code : undefined;

        setErrorMessage(
          (errorCode && SOCIAL_LOGIN_ERROR_MESSAGES[errorCode]) ??
            DEFAULT_ERROR_MESSAGE
        );
      });
  }, [navigate, setAuth]);

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <Logo />

      {errorMessage ? (
        <>
          <p className="text-sm font-medium text-main-5">{errorMessage}</p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="text-sm font-bold text-gray-4"
          >
            로그인으로 돌아가기
          </button>
        </>
      ) : (
        <p className="text-sm font-medium text-gray-4">로그인 처리 중...</p>
      )}
    </main>
  );
}

export default KakaoCallbackPage;
