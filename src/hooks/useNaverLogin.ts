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

      // authorize()는 이미 동의한 사용자에겐 네이버 동의 화면을 건너뛰고
      // 곧장 콜백으로 리다이렉트해버려서, 매번 동의 화면을 다시 띄우려면
      // reprompt()를 써야 한다. reprompt()는 내부적으로 로그인 상태를
      // 초기화하는 loginStatus를 참조하는데, 이건 init()에서만
      // 만들어지므로 반드시 init()을 먼저 호출해야 한다(SDK 소스 확인함:
      // init()은 로그인 버튼 DOM을 찾아 붙이는 코드도 같이 돌지만,
      // loginButton 옵션을 안 넘겨서 그 경로는 전부 null 가드로 스킵된다).
      // 둘 다 페이지를 이동시키는 리다이렉트라 Promise/팝업 반환은 없다.
      const naverLogin = new window.naver!.LoginWithNaverId({
        clientId: NAVER_CLIENT_ID,
        callbackUrl: getNaverCallbackUrl(),
        isPopup: false,
      });

      naverLogin.init();
      naverLogin.reprompt();
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return { loginWithNaver, isLoading };
}
