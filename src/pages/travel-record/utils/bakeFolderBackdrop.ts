/** backdrop-filter가 SVG/PNG 변환에서 빠지는 것을 막기 위해 픽셀에 직접 블러를 굽는다. */
export async function bakeFolderBackdrops(
  root: HTMLElement
): Promise<() => void> {
  const { toCanvas } = await import('html-to-image');
  const cleanups: Array<() => void> = [];
  const cleanup = () => cleanups.reverse().forEach((restore) => restore());
  try {
    for (const artwork of root.querySelectorAll<HTMLElement>(
      '[data-folder-artwork]'
    )) {
      const front = artwork.querySelector<HTMLElement>('[data-folder-front]');
      if (!front) continue;
      const computed = getComputedStyle(front);
      const blur = Number(
        computed.backdropFilter.match(/blur\(([\d.]+)px\)/)?.[1]
      );
      if (!blur) throw new Error('폴더 블러 값을 확인할 수 없어요.');
      const ratio = 3;
      const width = artwork.offsetWidth;
      const height = artwork.offsetHeight;
      const top = front.offsetTop;
      const frontWidth = front.offsetWidth;
      const frontHeight = front.offsetHeight;
      const tint = computed.backgroundColor;
      const background =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-background')
          .trim() || '#f1f1f1';
      const holder = document.createElement('div');
      holder.style.cssText =
        'position:fixed;left:-20000px;top:0;pointer-events:none';
      holder.setAttribute('aria-hidden', 'true');
      const clone = artwork.cloneNode(true) as HTMLElement;
      // 앞면과 스티커를 제외한 실제 사진·그림자만 배경으로 사용한다.
      clone.querySelector('[data-folder-front]')?.remove();
      clone.querySelector('[data-folder-stickers]')?.remove();
      holder.append(clone);
      document.body.append(holder);
      let source: HTMLCanvasElement;
      try {
        source = await toCanvas(clone, {
          width,
          height,
          pixelRatio: ratio,
          backgroundColor: background,
          fetchRequestInit: {
            mode: 'cors',
            credentials: 'omit',
            cache: 'reload',
          },
        });
      } finally {
        holder.remove();
      }
      // 흐림이 가장자리에서 잘리지 않도록 충분한 배경 여백을 둔다.
      const padding = Math.ceil(blur * 3);
      const blurred = document.createElement('canvas');
      blurred.width = (width + padding * 2) * ratio;
      blurred.height = (height + padding * 2) * ratio;
      const context = blurred.getContext('2d');
      if (!context || !('filter' in context))
        throw new Error('이 브라우저에서 공유 이미지 블러를 지원하지 않아요.');
      context.fillStyle = background;
      context.fillRect(0, 0, blurred.width, blurred.height);
      context.filter = `blur(${blur * ratio}px)`;
      context.drawImage(source, padding * ratio, padding * ratio);
      const cropped = document.createElement('canvas');
      cropped.width = frontWidth * ratio;
      cropped.height = frontHeight * ratio;
      const output = cropped.getContext('2d');
      if (!output) throw new Error('공유 이미지를 만들지 못했어요.');
      output.drawImage(
        blurred,
        padding * ratio,
        (padding + top) * ratio,
        cropped.width,
        cropped.height,
        0,
        0,
        cropped.width,
        cropped.height
      );
      output.fillStyle = tint;
      output.fillRect(0, 0, cropped.width, cropped.height);
      const image = new Image();
      image.src = cropped.toDataURL('image/png');
      image.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
      const previous = front.getAttribute('style');
      front.style.backdropFilter = 'none';
      front.style.setProperty('-webkit-backdrop-filter', 'none');
      front.prepend(image);
      cleanups.push(() => {
        image.remove();
        if (previous === null) front.removeAttribute('style');
        else front.setAttribute('style', previous);
      });
      await image.decode();
    }
    return cleanup;
  } catch (error) {
    cleanup();
    throw error;
  }
}
