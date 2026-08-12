import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { NormalizedApiError } from '../../../apis/common';
import { socialLogin } from '../../../apis/auth.api';
import { Logo } from '../../../components/common';
import {
  getKakaoCallbackUrl,
  KAKAO_OAUTH_STATE_KEY,
} from '../../../hooks/useKakaoLogin';
import { useAuthStore } from '../../../store/auth.store';

const DEFAULT_ERROR_MESSAGE =
  '카카오 로그인에 실패했습니다. 다시 시도해 주세요.';
const STATE_MISMATCH_ERROR_MESSAGE =
  '로그인 요청이 유효하지 않습니다. 다시 시도해 주세요.';

// social-login API에 실제로 매핑된 에러 코드만 반영.
const SOCIAL_LOGIN_ERROR_MESSAGES: Record<string, string> = {
  COMMON4001: '잘못된 요청입니다.',
  EXT4001: '지원하지 않는 소셜 로그인입니다.',
  AUTH4002:
    '이메일 제공에 동의해야 로그인할 수 있어요. 카카오 로그인 시 이메일 제공에 동의해 주세요.',
  AUTH4005: '소셜 로그인 요청값이 올바르지 않습니다. 다시 시도해 주세요.',
  AUTH4011: '유효하지 않은 소셜 인증 정보입니다. 다시 시도해 주세요.',
  AUTH4015: '카카오 인증이 만료되었거나 유효하지 않습니다. 다시 시도해 주세요.',
  COMMON5001:
    '카카오 서버와 통신 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  USER4101: '이미 탈퇴한 회원입니다.',
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

  return {
    code: params.get('code'),
    kakaoError: params.get('error'),
    state: params.get('state'),
  };
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

    const { code, kakaoError, state } = parseKakaoCallbackParams();

    // 이번 콜백에서 소모할 state는 성공/실패/취소 여부와 무관하게 여기서
    // 즉시 꺼내 지운다 — 같은 값이 재사용되는 것을 막기 위함이다.
    const storedState = sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY);
    sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY);

    if (kakaoError || !code) {
      return;
    }

    // CSRF 방지: authorize() 호출 시 세션스토리지에 저장해둔 state와
    // 카카오가 돌려준 state가 일치하는지 확인한다. 일치하지 않으면(또는
    // 둘 중 하나라도 없으면) social-login을 호출하지 않고 여기서
    // 종료한다 — isNewUser 분기나 setAuth()는 이 아래에서만 실행되므로
    // 이 return으로 자연스럽게 막힌다.
    if (!state || !storedState || state !== storedState) {
      // sessionStorage 소비(위)는 hasHandledRef로 이미 1회로 보장되고,
      // 이 페이지는 콜백 처리 전용이라 여기서 setState해도 추가
      // 리렌더가 다른 상태와 연쇄되지 않는다 — lazy initializer로
      // 옮기면 StrictMode 개발 모드에서 두 번 실행돼 sessionStorage
      // 값을 조기 소비해버리므로 여기 남겨둔다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMessage(STATE_MISMATCH_ERROR_MESSAGE);
      return;
    }

    // redirectUri는 authorize() 호출 때 넘긴 값과 정확히 일치해야 하므로
    // useKakaoLogin.ts의 getKakaoCallbackUrl()을 그대로 공유해서 쓴다.
    socialLogin({
      provider: 'KAKAO',
      authorizationCode: code,
      redirectUri: getKakaoCallbackUrl(),
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
          role: result.role as string,
          accessToken: result.accessToken as string,
          refreshToken: result.refreshToken as string,
        });
        navigate('/', { replace: true });
      })
      .catch((error: unknown) => {
        const errorCode = isNormalizedApiError(error) ? error.code : undefined;
        const mappedMessage = errorCode
          ? SOCIAL_LOGIN_ERROR_MESSAGES[errorCode]
          : undefined;

        setErrorMessage(mappedMessage ?? DEFAULT_ERROR_MESSAGE);
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
