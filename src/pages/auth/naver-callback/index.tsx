import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { NormalizedApiError } from '../../../apis/common';
import { socialLogin } from '../../../apis/auth.api';
import { Logo } from '../../../components/common';
import { getNaverCallbackUrl } from '../../../hooks/useNaverLogin';
import { useAuthStore } from '../../../store/auth.store';
import { loadNaverAuthSdk } from '../../../utils/naverAuth';

const DEFAULT_ERROR_MESSAGE =
  '네이버 로그인에 실패했습니다. 다시 시도해 주세요.';

// social-login API에 실제로 매핑된 에러 코드만 반영.
const SOCIAL_LOGIN_ERROR_MESSAGES: Record<string, string> = {
  EXT4001: '지원하지 않는 소셜 로그인입니다.',
  AUTH4002:
    '이메일 제공에 동의해야 로그인할 수 있어요. 네이버 로그인 시 이메일 제공에 동의해 주세요.',
  AUTH4011: '유효하지 않은 소셜 인증 정보입니다. 다시 시도해 주세요.',
  USER4101: '이미 탈퇴한 회원입니다.',
};

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID ?? '';

function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

// 네이버는 OAuth 표준 implicit grant 응답 형식(#error=...)을 그대로
// 쓰므로, SDK를 불러오기 전에 hash만 먼저 봐서 사용자가 로그인을
// 취소했는지 동기적으로 판단할 수 있다 (최초 렌더 시점에 lazy
// initializer로 계산 — effect 안에서 setState하지 않기 위함).
function hasNaverAuthError(): boolean {
  const hash = window.location.hash.replace(/^#/, '');
  const params = new URLSearchParams(hash);

  return Boolean(params.get('error'));
}

function NaverCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState(() =>
    hasNaverAuthError() ? '네이버 로그인이 취소되었습니다.' : ''
  );
  // StrictMode에서 effect가 두 번 실행돼도 social-login API를 두 번
  // 호출하지 않도록 막는다.
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current || hasNaverAuthError()) {
      return;
    }
    hasHandledRef.current = true;

    loadNaverAuthSdk()
      .then(() => {
        const naverLogin = new window.naver!.LoginWithNaverId({
          clientId: NAVER_CLIENT_ID,
          callbackUrl: getNaverCallbackUrl(),
          isPopup: false,
        });

        // init()이 현재 URL의 hash(access_token/state)를 검증하고
        // naverLogin.accessToken에 채워 넣는다. 그 결과를
        // getLoginStatus()로 확인한다(내부적으로 네이버 프로필 조회까지
        // 성공해야 status가 true).
        naverLogin.init();

        naverLogin.getLoginStatus((status) => {
          const accessToken = naverLogin.accessToken?.accessToken;

          if (!status || !accessToken) {
            setErrorMessage(DEFAULT_ERROR_MESSAGE);
            return;
          }

          socialLogin({ provider: 'NAVER', accessToken })
            .then((result) => {
              if (result.isNewUser) {
                navigate('/signup/naver', {
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
              const errorCode = isNormalizedApiError(error)
                ? error.code
                : undefined;

              setErrorMessage(
                (errorCode && SOCIAL_LOGIN_ERROR_MESSAGES[errorCode]) ??
                  DEFAULT_ERROR_MESSAGE
              );
            });
        });
      })
      .catch(() => {
        setErrorMessage(DEFAULT_ERROR_MESSAGE);
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

export default NaverCallbackPage;
