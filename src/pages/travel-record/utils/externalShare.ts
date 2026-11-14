import type { TravelRecordFolder } from '../types';

export interface TravelShareData {
  title: string;
  text: string;
  url: string;
}

export function getTravelFolderShareData(
  folder: TravelRecordFolder,
  origin: string
): TravelShareData | null {
  if (
    folder.visibility !== 'public' ||
    folder.permissions?.canLinkShare !== true ||
    !/^\d+$/.test(folder.id) ||
    Number(folder.id) <= 0
  )
    return null;
  return {
    title: `${folder.title} | 여기도`,
    text: '여기도에서 여행 폴더를 확인해 보세요.',
    url: new URL(`/travel-record/${folder.id}`, origin).href,
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
    buttonTitle: '폴더 보기',
  };
}
