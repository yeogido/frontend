import { useState } from 'react';

import { loadNaverAuthSdk } from '../utils/naverAuth';

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID ?? '';

export const NAVER_CALLBACK_PATH = '/auth/naver/callback';

export function getNaverCallbackUrl(): string {
  return `${window.location.origin}${NAVER_CALLBACK_PATH}`;
}

export function useNaverLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithNaver = async () => {
    setIsLoading(true);

    try {
      if (!NAVER_CLIENT_ID.trim()) {
        throw new Error('[VITE_NAVER_CLIENT_ID]가 설정되지 않았습니다.');
      }

      await loadNaverAuthSdk();

      // authorize()는 네이버 로그인 페이지로 현재 페이지를 이동시킨다
      // (팝업/Promise 반환 없음). 성공하면 이 호출 이후 코드는 실행되지
      // 않고, callbackUrl(NAVER_CALLBACK_PATH)로 돌아오면서 이어진다.
      const naverLogin = new window.naver!.LoginWithNaverId({
        clientId: NAVER_CLIENT_ID,
        callbackUrl: getNaverCallbackUrl(),
        isPopup: false,
      });

      naverLogin.authorize();
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return { loginWithNaver, isLoading };
}
