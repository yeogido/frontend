const nameSegmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });

export function getNicknameAvatarLabel(name: string): string {
  const characters = Array.from(
    nameSegmenter.segment(name.trim()),
    ({ segment }) => segment
  );

  return characters.slice(-2).join('') || '?';
}
