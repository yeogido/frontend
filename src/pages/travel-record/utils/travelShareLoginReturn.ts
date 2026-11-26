type ReturnStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const KEY = 'travel-share-login-return';
const VALID_PATH = /^\/travel-record\/shared\/[a-f0-9]{64}$/;

export function rememberTravelShareReturn(
  storage: ReturnStorage,
  path: string
) {
  try {
    if (VALID_PATH.test(path)) storage.setItem(KEY, path);
    else storage.removeItem(KEY);
  } catch {
    /* 저장소를 사용할 수 없으면 로그인 후 홈으로 이동한다. */
  }
}

export function consumeTravelShareReturn(storage?: ReturnStorage): string {
  try {
    const targetStorage = storage ?? sessionStorage;
    const path = targetStorage.getItem(KEY);
    targetStorage.removeItem(KEY);
    return path && VALID_PATH.test(path) ? path : '/';
  } catch {
    return '/';
  }
}
