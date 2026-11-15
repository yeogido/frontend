export const QR_VALID_SECONDS = 180;

// 서버의 만료 시각 대신 요청을 시작한 시각 기준으로 센다. 서버는 항상 요청이
// 시작된 뒤에 발급하므로, 응답이 늦어도 화면이 서버 만료보다 오래 남지 않는다.
// 기기 시계가 어긋나도 처음부터 만료로 보이지 않는다.
export function getQrExpiresAt(requestedAtMs: number): number {
  return requestedAtMs + QR_VALID_SECONDS * 1000;
}

export function getRemainingSeconds(
  expiresAtMs: number,
  nowMs: number
): number {
  return Math.max(0, Math.ceil((expiresAtMs - nowMs) / 1000));
}

export function isQrExpired(expiresAtMs: number, nowMs: number): boolean {
  return nowMs >= expiresAtMs;
}

export function formatCountdown(totalSeconds: number): string {
  const seconds = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.floor(totalSeconds))
    : 0;
  const minutes = Math.floor(seconds / 60);

  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

// 서버가 아직 qrToken을 주지 않을 수 있다. 문자열이고 공백이 아닌 값만 쓴다.
export function getValidQrToken(qrToken: unknown): string | null {
  return typeof qrToken === 'string' && qrToken.trim() !== '' ? qrToken : null;
}

// 토큰이 없으면 빈 값이 들어간 URL을 만들지 않고 null을 돌려준다.
export function buildFriendQrUrl(
  origin: string,
  qrToken: unknown
): string | null {
  const validToken = getValidQrToken(qrToken);

  return validToken
    ? `${origin}/friends/add?qr=${encodeURIComponent(validToken)}`
    : null;
}
