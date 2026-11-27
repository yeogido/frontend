import { bakeFolderBackdrops } from './bakeFolderBackdrop';

export interface ShareCardPng {
  file: File;
  width: number;
  height: number;
}

export const KAKAO_SHARE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** 원본 URL을 CORS로 검증하고, 폰트·이미지가 모두 준비된 카드만 변환한다. */
export async function createShareCardPng(
  node: HTMLElement,
  imageSources: readonly string[]
): Promise<ShareCardPng> {
  let timer: ReturnType<typeof setTimeout>;
  const capture = async () => {
    const { toBlob } = await import('html-to-image');
    await document.fonts.ready;
    const images = [...node.querySelectorAll('img')];
    const originals = images.map((image) => ({
      image,
      src: image.getAttribute('src'),
      loading: image.loading,
    }));
    // 일반 표시에서 읽은 비CORS 캐시를 재사용하지 않고 합성용으로 새로 받는다.
    const sources = [
      ...new Set([
        ...imageSources.filter(Boolean),
        ...images.map((image) => image.currentSrc || image.src),
      ]),
    ];
    const embedded = new Map(
      await Promise.all(
        sources.map(async (src) => {
          const response = await fetch(src, {
            mode: 'cors',
            credentials: 'omit',
            cache: 'reload',
          });
          if (!response.ok) throw new Error('공유 이미지를 불러오지 못했어요.');
          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              typeof reader.result === 'string'
                ? resolve(reader.result)
                : reject(new Error('공유 이미지 변환에 실패했어요.'));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          });
          return [src, dataUrl] as const;
        })
      )
    );
    let restoreBackdrop: (() => void) | undefined;
    try {
      images.forEach((image) => {
        const source = image.currentSrc || image.src;
        image.loading = 'eager';
        image.src = embedded.get(source)!;
      });
      await Promise.all(images.map((image) => image.decode()));
      restoreBackdrop = await bakeFolderBackdrops(node);
      const pixelRatio = 3;
      const blob = await toBlob(node, {
        pixelRatio,
        backgroundColor: '#f9f9f9',
        includeQueryParams: true,
        fetchRequestInit: {
          mode: 'cors',
          credentials: 'omit',
          cache: 'reload',
        },
      });
      if (!blob || blob.size === 0)
        throw new Error('공유 이미지를 생성하지 못했어요. 다시 시도해 주세요.');
      if (blob.size > KAKAO_SHARE_IMAGE_MAX_BYTES)
        throw new Error('공유 이미지가 5MB를 초과했어요.');
      return {
        file: new File([blob], 'travel-folder.png', { type: 'image/png' }),
        width: node.offsetWidth * pixelRatio,
        height: node.offsetHeight * pixelRatio,
      };
    } finally {
      restoreBackdrop?.();
      originals.forEach(({ image, src, loading }) => {
        if (src === null) image.removeAttribute('src');
        else image.setAttribute('src', src);
        image.loading = loading;
      });
    }
  };
  try {
    return await Promise.race([
      capture(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                '공유 이미지 생성 시간이 초과됐어요. 다시 시도해 주세요.'
              )
            ),
          20000
        );
      }),
    ]);
  } finally {
    clearTimeout(timer!);
  }
}
