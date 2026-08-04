const NAVER_AUTH_SCRIPT_ID = 'naver-auth-sdk';
const NAVER_SDK_VERSION = '2.0.2';
let sdkPromise: Promise<void> | null = null;

export function loadNaverAuthSdk(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(
      new Error('브라우저에서만 네이버 로그인을 불러올 수 있습니다.')
    );
  }

  if (window.naver?.LoginWithNaverId) {
    return Promise.resolve();
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    const handleLoad = () => {
      if (!window.naver?.LoginWithNaverId) {
        sdkPromise = null;
        reject(new Error('네이버 SDK를 초기화하지 못했습니다.'));
        return;
      }

      resolve();
    };

    const handleError = () => {
      sdkPromise = null;
      reject(new Error('네이버 SDK를 불러오지 못했습니다.'));
    };

    const existingScript = document.getElementById(
      NAVER_AUTH_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.naver?.LoginWithNaverId) {
        handleLoad();
        return;
      }

      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = NAVER_AUTH_SCRIPT_ID;
    script.async = true;
    script.src = `https://static.nid.naver.com/js/naveridlogin_js_sdk_${NAVER_SDK_VERSION}.js`;
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    document.head.appendChild(script);
  });

  return sdkPromise;
}
