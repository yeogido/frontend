import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';

import closeRounded from '../../../assets/icons/close-rounded.svg';
import NicknameAvatar from '../../../components/common/NicknameAvatar';
import { LoadingSpinner } from '../../../components/common';
import { useToast } from '../../../components/toast';
import { useMyFriendCode } from '../../../hooks/useMyFriendCode';
import { getFriendAvatarColor } from '../utils/friendAvatarColor';
import {
  buildFriendQrUrl,
  formatCountdown,
  getQrExpiresAt,
  getRemainingSeconds,
  isQrExpired,
} from '../utils/friendQrCountdown';

// 모든 수치는 Figma 390 디자인 기준 리터럴 px. scale은 useGlobalScale 값이다.
const PAGE_PADDING_X = 24;
const CARD_MAX_WIDTH = 342;
const CARD_PADDING_X = 64;
const CARD_PADDING_BOTTOM = 36;
const CARD_RADIUS = 16;
const CLOSE_ICON_SIZE = 24;
const CLOSE_OFFSET = 20;
const AVATAR_OUTER_SIZE = 120;
const AVATAR_RING = 4;
const AVATAR_OVERLAP = 75;
const NAME_GAP = 12;
const NAME_SIZE = 24;
const CODE_GAP = 6;
const CODE_SIZE = 16;
const COPY_ICON_SIZE = 16;
const COPY_ICON_GAP = 4;
const QR_GAP = 32;
const QR_SIZE = 214;
const TIMER_GAP = 16;
const TIMER_SIZE = 20;
const TIMER_HEIGHT = 30;
const STATUS_GAP = 16;
const STATUS_SIZE = 16;
const ACTION_PADDING_X = 16;
const ACTION_PADDING_Y = 8;
const ACTION_TEXT_SIZE = 14;

const COPY_SUCCESS_MESSAGE = '친구 코드를 복사했어요.';
const COPY_FAILURE_MESSAGE = '친구 코드를 복사하지 못했어요.';

interface MyQrDialogProps {
  userId: number;
  name: string;
  scale: number;
  onClose: () => void;
}

/**
 * 내 친구 코드와 QR을 보여 주는 다이얼로그. 열릴 때마다 새 QR을 받는다.
 *
 * 남은 시간은 틱 횟수가 아니라 "요청을 시작한 시각 + 180초"와 현재 시각의 차로
 * 매번 다시 계산하므로, 탭이 백그라운드에 있다 돌아와도 어긋나지 않는다.
 * 응답이 늦어도 서버 만료보다 오래 남지 않도록 응답 시각이 아니라 요청 시작
 * 시각을 기준으로 한다.
 * 위가 잘리지 않도록 오버레이 전체가 세로로 스크롤되고, 닫으면 열기 전에
 * 포커스가 있던 요소로 돌아간다.
 * 만료되면 저절로 새로 받지 않고 버튼으로만 새로 받는다.
 * 배경을 눌러서는 닫히지 않고 X와 Esc로 닫힌다.
 */
function MyQrDialog({ userId, name, scale, onClose }: MyQrDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { showToast } = useToast();
  const { data, requestedAt, isFetching, isError, refetch } = useMyFriendCode();
  const [now, setNow] = useState(() => Date.now());

  // 열리는 시점의 포커스(보통 모달을 연 버튼)를 기억해 두었다가 닫힐 때 돌려준다.
  // StrictMode가 effect를 한 번 정리했다 다시 실행해도, 정리 단계에서 먼저 돌려
  // 주므로 다시 실행될 때 같은 요소를 기억한다.
  useEffect(() => {
    const previouslyFocused = document.activeElement;

    closeButtonRef.current?.focus();

    return () => {
      if (
        previouslyFocused instanceof HTMLElement &&
        previouslyFocused !== document.body &&
        previouslyFocused.isConnected
      ) {
        previouslyFocused.focus();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>('button:not([disabled])')
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!first || !last) {
        event.preventDefault();
        panel.focus();
      } else if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 1초마다 현재 시각만 갱신한다. 탭이 다시 보이면 기다리지 않고 바로 갱신한다.
  useEffect(() => {
    const refreshNow = () => setNow(Date.now());
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshNow();
    };

    refreshNow();
    const timerId = window.setInterval(refreshNow, 1000);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestedAt]);

  const handleCopy = async () => {
    if (!data) return;

    try {
      await navigator.clipboard.writeText(data.friendCode);
      showToast(COPY_SUCCESS_MESSAGE);
    } catch {
      showToast(COPY_FAILURE_MESSAGE);
    }
  };

  if (typeof document === 'undefined') {
    return null;
  }

  const expiresAt =
    requestedAt === undefined ? null : getQrExpiresAt(requestedAt);
  // 요청보다 이전 시각으로 계산하지 않도록 요청 시작 시각 아래로 내려가지 않게 한다.
  const currentTime = Math.max(now, requestedAt ?? now);
  const isLoading = isFetching;
  const qrUrl = data
    ? buildFriendQrUrl(window.location.origin, data.qrToken)
    : null;
  const hasFailed = !isLoading && (isError || !qrUrl);
  const isExpired =
    !isLoading &&
    !hasFailed &&
    expiresAt !== null &&
    isQrExpired(expiresAt, currentTime);
  const readyUrl = !isLoading && !hasFailed && !isExpired ? qrUrl : null;

  const actionButtonStyle = {
    marginTop: STATUS_GAP * scale,
    padding: `${ACTION_PADDING_Y * scale}px ${ACTION_PADDING_X * scale}px`,
    fontSize: ACTION_TEXT_SIZE * scale,
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/30">
      <div
        className="flex min-h-full items-center justify-center"
        style={{
          paddingInline: PAGE_PADDING_X * scale,
          // 아바타가 카드 위로 튀어나온 높이만큼 위아래에 여백을 두어, 화면이 낮아
          // 스크롤할 때도 아바타와 닫기 버튼까지 닿는다.
          paddingBlock: AVATAR_OVERLAP * scale,
        }}
      >
        <section
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="bg-pure-white relative flex w-full flex-col items-center outline-none"
          style={{
            maxWidth: CARD_MAX_WIDTH * scale,
            paddingInline: CARD_PADDING_X * scale,
            paddingBottom: CARD_PADDING_BOTTOM * scale,
            paddingTop: 0,
            borderRadius: CARD_RADIUS * scale,
          }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute"
            style={{
              top: CLOSE_OFFSET * scale,
              right: CLOSE_OFFSET * scale,
              width: CLOSE_ICON_SIZE * scale,
              height: CLOSE_ICON_SIZE * scale,
            }}
          >
            <img
              src={closeRounded}
              alt=""
              aria-hidden="true"
              className="size-full"
            />
          </button>

          <div
            className="bg-pure-white flex shrink-0 items-center justify-center rounded-full"
            style={{
              marginTop: -AVATAR_OVERLAP * scale,
              width: AVATAR_OUTER_SIZE * scale,
              height: AVATAR_OUTER_SIZE * scale,
            }}
          >
            <NicknameAvatar
              name={name}
              color={getFriendAvatarColor(userId)}
              size={(AVATAR_OUTER_SIZE - AVATAR_RING * 2) * scale}
            />
          </div>

          <h2
            id={titleId}
            className="max-w-full truncate font-semibold text-black"
            style={{
              marginTop: NAME_GAP * scale,
              fontSize: NAME_SIZE * scale,
              lineHeight: 'normal',
            }}
          >
            {name}
          </h2>

          {data ? (
            <button
              type="button"
              aria-label={`친구 코드 ${data.friendCode} 복사`}
              onClick={() => void handleCopy()}
              className="text-gray-4 flex items-center font-normal"
              style={{
                marginTop: CODE_GAP * scale,
                gap: COPY_ICON_GAP * scale,
                fontSize: CODE_SIZE * scale,
                lineHeight: 'normal',
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{
                  width: COPY_ICON_SIZE * scale,
                  height: COPY_ICON_SIZE * scale,
                }}
              >
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              </svg>
              {data.friendCode}
            </button>
          ) : (
            <div style={{ marginTop: CODE_GAP * scale, height: 19 * scale }} />
          )}

          <div
            className="flex flex-col items-center justify-center text-center"
            style={{
              marginTop: QR_GAP * scale,
              width: QR_SIZE * scale,
              height: QR_SIZE * scale,
            }}
          >
            {isLoading ? (
              <LoadingSpinner label="QR 코드를 불러오는 중" />
            ) : null}
            {hasFailed ? (
              <div role="alert" className="flex flex-col items-center">
                <p
                  className="text-gray-4 font-medium"
                  style={{
                    fontSize: STATUS_SIZE * scale,
                    lineHeight: 'normal',
                  }}
                >
                  QR 코드를 불러오지 못했어요
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="border-gray-2 text-gray-5 rounded-full border font-medium"
                  style={actionButtonStyle}
                >
                  다시 시도
                </button>
              </div>
            ) : null}
            {isExpired ? (
              <div role="status" className="flex flex-col items-center">
                <p
                  className="text-gray-4 font-medium"
                  style={{
                    fontSize: STATUS_SIZE * scale,
                    lineHeight: 'normal',
                  }}
                >
                  QR 코드가 만료됐어요
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="bg-main-5 text-pure-white rounded-full font-medium"
                  style={actionButtonStyle}
                >
                  새로 받기
                </button>
              </div>
            ) : null}
            {readyUrl ? (
              <QRCodeSVG
                value={readyUrl}
                size={QR_SIZE * scale}
                level="M"
                marginSize={0}
                role="img"
                aria-label="내 친구 QR 코드"
              />
            ) : null}
          </div>

          <div
            className="flex items-center justify-center"
            style={{
              marginTop: TIMER_GAP * scale,
              height: TIMER_HEIGHT * scale,
            }}
          >
            {readyUrl ? (
              <p
                role="timer"
                aria-label="QR 코드 남은 시간"
                className="text-gray-4 font-normal"
                style={{ fontSize: TIMER_SIZE * scale, lineHeight: 1.5 }}
              >
                {formatCountdown(
                  getRemainingSeconds(expiresAt ?? currentTime, currentTime)
                )}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>,
    document.body
  );
}

export default MyQrDialog;
