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

      // authorize()는 페이지를 이동시키는 리다이렉트라 Promise/팝업
      // 반환은 없다. 이미 동의한 사용자는 네이버 동의 화면을 건너뛰고
      // 곧장 콜백으로 리다이렉트된다(카카오 authorize()와 동일한 기본
      // 동작).
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
