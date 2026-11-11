export const QR_VALID_SECONDS = 180;

// 서버의 만료 시각 대신 응답을 받은 시각 기준으로 센다. 기기 시계가 어긋나도
// 처음부터 만료로 보이지 않는다.
export function getQrExpiresAt(receivedAtMs: number): number {
  return receivedAtMs + QR_VALID_SECONDS * 1000;
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

export function buildFriendQrUrl(origin: string, qrToken: string): string {
  return `${origin}/friends/add?qr=${encodeURIComponent(qrToken)}`;
}
