// React를 import하지 않는다. 순수 계산만 담아 Node 테스트 러너에서 그대로
// 검증할 수 있게 한다(측정과 관찰은 hooks/useVisibleItemCount.ts가 맡는다).

/**
 * 소수점 반올림 오차 허용치.
 *
 * 카드가 transform: scale()로 축소돼 폭이 정수로 떨어지지 않는다. 딱 맞게
 * 그려진 항목이 0.1px 차이로 잘려 사라지지 않도록 이만큼은 봐준다.
 */
export const ITEM_FIT_EPSILON = 0.5;

/**
 * 한 줄에 온전히 들어가는 항목 개수.
 *
 * 잘린 항목을 보여주지 않으려고, 미리 잰 폭을 앞에서부터 gap과 함께 더해
 * 컨테이너를 넘기기 직전까지만 센다.
 *
 * 폭이 0인 항목은 아직 크기를 알 수 없는 상태다(태그 칩은 이미지라 로드 전
 * 폭이 0이다). 거기서 멈추되 그 앞까지는 세므로, 한 항목이 끝내 안 재져도
 * 나머지가 통째로 사라지지 않는다.
 */
export function countFittingItems(
  widths: readonly number[],
  gap: number,
  containerWidth: number
): number {
  let total = 0;
  let count = 0;

  for (const width of widths) {
    if (!(width > 0)) {
      break;
    }

    const next = count === 0 ? width : total + gap + width;

    if (next > containerWidth + ITEM_FIT_EPSILON) {
      break;
    }

    total = next;
    count++;
  }

  return count;
}

export function selectFittingItemsWithRequiredIndex(
  widths: readonly number[],
  gap: number,
  containerWidth: number,
  requiredIndex: number | readonly number[]
): number[] {
  const requiredIndexes = Array.from(
    new Set(Array.isArray(requiredIndex) ? requiredIndex : [requiredIndex])
  ).sort((a, b) => a - b);

  if (
    requiredIndexes.length === 0 ||
    requiredIndexes.some((index) => index < 0 || index >= widths.length)
  ) {
    return Array.from(
      { length: countFittingItems(widths, gap, containerWidth) },
      (_, index) => index
    );
  }

  if (requiredIndexes.some((index) => !(widths[index] > 0))) return [];

  const selectedIndexes = new Set(requiredIndexes);
  let total = requiredIndexes.reduce((sum, index) => sum + widths[index], 0);
  total += gap * (requiredIndexes.length - 1);

  for (let index = 0; index < widths.length; index += 1) {
    if (selectedIndexes.has(index) || !(widths[index] > 0)) continue;

    const next = total + gap + widths[index];
    if (next <= containerWidth + ITEM_FIT_EPSILON) {
      total = next;
      selectedIndexes.add(index);
    }
  }

  return Array.from(selectedIndexes).sort((a, b) => a - b);
}
