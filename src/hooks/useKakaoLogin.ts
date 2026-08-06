import { useState } from 'react';

import { loadKakaoAuthSdk } from '../utils/kakaoAuth';

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY ?? '';
const KAKAO_LOGIN_SCOPE = 'account_email';

export const KAKAO_CALLBACK_PATH = '/auth/kakao/callback';
// 콜백 페이지가 세션스토리지에서 같은 키로 값을 꺼내 검증하므로 공유한다.
export const KAKAO_OAUTH_STATE_KEY = 'kakao_oauth_state';

export function getKakaoCallbackUrl(): string {
  return `${window.location.origin}${KAKAO_CALLBACK_PATH}`;
}

export function useKakaoLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithKakao = async () => {
    setIsLoading(true);

    try {
      await loadKakaoAuthSdk(KAKAO_JS_KEY);

      // CSRF 방지: 요청마다 예측 불가능한 state를 생성해 세션스토리지에
      // 저장해두고, 카카오가 그대로 돌려준 state가 이 값과 일치하는지
      // 콜백 페이지에서 검증한다 (일치하지 않으면 소셜 로그인 요청을
      // 진행하지 않음).
      const state = crypto.randomUUID();
      sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, state);

      // authorize()는 카카오 로그인 페이지로 현재 페이지를 이동시킨다
      // (팝업/Promise 반환 없음). 성공하면 이 호출 이후 코드는 실행되지
      // 않고, redirectUri(KAKAO_CALLBACK_PATH)로 돌아오면서 이어진다.
      // 콜백 페이지가 social-login에 보낼 redirectUri는 반드시 이 값과
      // 동일해야 하므로 getKakaoCallbackUrl()을 그대로 공유해서 쓴다.
      window.Kakao!.Auth.authorize({
        redirectUri: getKakaoCallbackUrl(),
        scope: KAKAO_LOGIN_SCOPE,
        state,
      });
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return { loginWithKakao, isLoading };
}
