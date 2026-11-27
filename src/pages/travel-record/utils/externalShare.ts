import type { TravelRecordFolder } from '../types';

export interface TravelShareData {
  title: string;
  text: string;
  url: string;
  buttonTitle?: string;
}

export interface KakaoShareImage {
  url: string;
  width: number;
  height: number;
}

/** 카카오 업로드 API는 HTTP CDN 주소도 반환한다. 알려진 CDN은 HTTPS로 사용한다. */
export function normalizeKakaoImageUrl(value: string): string {
  const url = new URL(value);
  if (url.username || url.password) throw new Error('Invalid uploaded image');
  if (
    url.protocol === 'http:' &&
    (url.hostname.endsWith('.kakaocdn.net') ||
      url.hostname.endsWith('.kakao.com'))
  ) {
    url.protocol = 'https:';
  }
  if (url.protocol !== 'https:') throw new Error('Invalid uploaded image');
  return url.href;
}

export function getKakaoTravelImageTemplate(
  data: TravelShareData,
  image: KakaoShareImage
) {
  const link = { mobileWebUrl: data.url, webUrl: data.url };
  return {
    objectType: 'feed' as const,
    content: {
      title: data.title,
      description: data.text,
      imageUrl: image.url,
      imageWidth: image.width,
      imageHeight: image.height,
      link,
    },
    buttons: [{ title: data.buttonTitle ?? '폴더 보기', link }],
  };
}

export function getTravelMapShareData(
  userId: number | null,
  nickname: string,
  origin: string
): TravelShareData | null {
  if (userId === null || !Number.isSafeInteger(userId) || userId <= 0)
    return null;
  return {
    title: `${nickname || '사용자'}님의 여행 지도 | 여기도`,
    text: '여기도에서 여행 지도를 확인해 보세요.',
    url: new URL(`/friends/${userId}?tab=map`, origin).href,
    buttonTitle: '지도 보기',
  };
}

export function getTravelFolderShareData(
  folder: TravelRecordFolder,
  origin: string,
  token: string
): TravelShareData | null {
  if (
    !['public', 'friends'].includes(folder.visibility ?? '') ||
    folder.permissions?.canLinkShare !== true ||
    !/^\d+$/.test(folder.id) ||
    Number(folder.id) <= 0 ||
    !/^[a-f0-9]{64}$/.test(token)
  )
    return null;
  return {
    title: `${folder.title} | 여기도`,
    text: '여기도에서 여행 폴더를 확인해 보세요.',
    url: new URL(`/travel-record/shared/${token}`, origin).href,
  };
}

export type TravelShareApp = 'x' | 'threads' | 'tumblr';

export function getTravelShareIntentUrl(
  app: TravelShareApp,
  data: TravelShareData
): string {
  const url = new URL(
    {
      x: 'https://x.com/intent/tweet',
      threads: 'https://www.threads.com/intent/post',
      tumblr: 'https://www.tumblr.com/widgets/share/tool',
    }[app]
  );
  const params: Record<string, string> =
    app === 'tumblr'
      ? {
          posttype: 'link',
          canonicalUrl: data.url,
          content: data.url,
          title: data.title,
        }
      : { url: data.url, text: data.title };
  url.search = new URLSearchParams(params).toString();
  return url.href;
}

export function getKakaoTravelShareTemplate(data: TravelShareData) {
  const characters = Array.from(
    [data.title, data.text].filter(Boolean).join('\n')
  );
  const text =
    characters.length > 200
      ? `${characters.slice(0, 199).join('')}…`
      : characters.join('');
  return {
    objectType: 'text' as const,
    text,
    link: { mobileWebUrl: data.url, webUrl: data.url },
    buttonTitle: data.buttonTitle ?? '폴더 보기',
  };
}
