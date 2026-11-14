import { useEffect, useRef, useState } from 'react';
import copyIcon from '../../../assets/icons/share/link-copy.svg';
import moreIcon from '../../../assets/icons/share/more.svg';
import kakaoIcon from '../../../assets/icons/share/kakaotalk.png';
import xIcon from '../../../assets/icons/share/x.svg';
import threadsIcon from '../../../assets/icons/share/threads.svg';
import tumblrIcon from '../../../assets/icons/share/external-7.svg';
import { useToast } from '../../../components/toast';
import { useAuthStore } from '../../../store/auth.store';
import { loadKakaoAuthSdk } from '../../../utils/kakaoAuth';
import {
  getKakaoTravelShareTemplate,
  getTravelShareIntentUrl,
  type TravelShareData,
} from '../utils/externalShare';

const actions = [
  { id: 'copy', label: '링크 복사', icon: copyIcon },
  { id: 'kakao', label: '카카오톡에 공유', icon: kakaoIcon },
  { id: 'x', label: 'X에 공유', icon: xIcon },
  { id: 'threads', label: 'Threads에 공유', icon: threadsIcon },
  { id: 'tumblr', label: 'Tumblr에 공유', icon: tumblrIcon },
  { id: 'more', label: '더보기', icon: moreIcon },
] as const;
type Action = (typeof actions)[number]['id'];

interface Props {
  data: TravelShareData | null;
  isBusy?: boolean;
  onBusyChange?: (busy: boolean) => void;
}

export default function TravelRecordExternalShareActions({
  data,
  isBusy = false,
  onBusyChange,
}: Props) {
  const { showToast } = useToast();
  const [pending, setPending] = useState<Action | null>(null);
  const [kakaoReady, setKakaoReady] = useState(false);
  const locked = useRef(false);
  const available = data !== null;

  useEffect(() => {
    if (!available) return;
    let active = true;
    void loadKakaoAuthSdk(import.meta.env.VITE_KAKAO_MAP_API_KEY ?? '')
      .then(() => {
        if (active) setKakaoReady(Boolean(window.Kakao?.Share));
      })
      .catch(() => {
        if (active) setKakaoReady(false);
      });
    return () => {
      active = false;
    };
  }, [available]);

  const handleShare = async (action: Action) => {
    if (!data || isBusy || locked.current) return;
    const session = useAuthStore.getState();
    if (session.userId === null) return;
    const isCurrentSession = () => {
      const current = useAuthStore.getState();
      return (
        current.userId === session.userId &&
        current.authGeneration === session.authGeneration
      );
    };
    locked.current = true;
    setPending(action);
    onBusyChange?.(true);
    try {
      if (
        action === 'copy' ||
        (action === 'more' &&
          (typeof navigator.share !== 'function' ||
            (typeof navigator.canShare === 'function' &&
              !navigator.canShare(data))))
      ) {
        if (!navigator.clipboard?.writeText)
          throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(data.url);
        if (isCurrentSession())
          showToast(
            action === 'copy'
              ? '링크를 복사했어요.'
              : '공유창을 지원하지 않아 링크를 복사했어요.'
          );
      } else if (action === 'more') {
        // 클릭 이벤트에서 직접 호출해 사용자 활성화를 유지한다.
        await navigator.share(data);
      } else if (action === 'kakao') {
        if (!kakaoReady || !window.Kakao?.Share)
          throw new Error('Kakao unavailable');
        await window.Kakao.Share.sendDefault(getKakaoTravelShareTemplate(data));
      } else {
        const popup = window.open('about:blank', '_blank');
        if (!popup) throw new Error('Popup blocked');
        popup.opener = null;
        popup.location.href = getTravelShareIntentUrl(action, data);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      if (isCurrentSession())
        showToast(
          action === 'copy'
            ? '링크를 복사하지 못했어요. 다시 시도해 주세요.'
            : '공유하지 못했어요. 다시 시도해 주세요.'
        );
    } finally {
      locked.current = false;
      setPending(null);
      onBusyChange?.(false);
    }
  };

  return (
    <ul
      aria-label="외부 앱으로 공유"
      className="scrollbar-hide -mx-5 mt-6 flex w-[calc(100%+40px)] gap-3 overflow-x-auto px-5"
    >
      {actions.map(({ id, label, icon }) => (
        <li key={id} className="shrink-0">
          <button
            type="button"
            aria-label={label}
            aria-busy={pending === id}
            disabled={
              !data ||
              isBusy ||
              pending !== null ||
              (id === 'kakao' && !kakaoReady)
            }
            title={
              !data
                ? '링크 공유가 허용된 전체공개 폴더에서 사용할 수 있어요.'
                : id === 'kakao' && !kakaoReady
                  ? '카카오톡 공유를 사용할 수 없어요.'
                  : label
            }
            onClick={() => void handleShare(id)}
            className={`focus-visible:outline-main-5 flex size-12 items-center justify-center overflow-hidden rounded-full focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:opacity-40 ${id === 'kakao' ? 'bg-[#f9e000]' : id === 'copy' || id === 'more' ? 'bg-[#e4e4e4]' : ''}`}
          >
            <img
              src={icon}
              alt=""
              aria-hidden="true"
              className={`block max-w-none shrink-0 ${id === 'kakao' ? 'size-10 object-cover' : ''}`}
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
