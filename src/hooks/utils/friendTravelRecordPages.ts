import type {
  FriendTravelRecordItem,
  GetFriendTravelRecordsResponse,
} from '../../types/friend.type';
import { toTravelRecordVisibility } from '../../pages/travel-record/mappers/travelRecordVisibility.ts';
import type { TravelFolderDecoration } from '../../pages/travel-record/folder-decoration/folderDecoration';
import type { TravelRecordFolder } from '../../pages/travel-record/types';

// 훅 파일은 react-query를 import해서 Node 테스트 러너가 읽지 못한다.
// 친구 여행 폴더의 페이지 병합, 폴더 변환, 기본 연도 결정만 따로 두어 그대로 검증한다.

/** 페이지를 하나의 목록으로 합친다. 같은 travelRecordId는 앞에 나온 것만 남긴다. */
export function getFriendTravelRecordsFromPages(
  pages: readonly Pick<GetFriendTravelRecordsResponse, 'items'>[] | undefined
): FriendTravelRecordItem[] {
  const seen = new Set<number>();
  const records: FriendTravelRecordItem[] = [];

  for (const page of pages ?? []) {
    for (const record of page.items) {
      if (!seen.has(record.travelRecordId)) {
        seen.add(record.travelRecordId);
        records.push(record);
      }
    }
  }

  return records;
}

/**
 * 다음 페이지를 받을 커서. hasNext가 true이고 cursorId가 있고 방금 요청한 커서와
 * 다를 때만 돌려준다. 같은 커서가 그대로 오면 서버가 같은 페이지를 계속 주는
 * 상태라 오류가 아니라 "다음 페이지 없음"으로 보고 멈춘다(이미 받은 목록은 유지).
 */
export function getNextFriendRecordsCursor(
  lastPage: Pick<GetFriendTravelRecordsResponse, 'hasNext' | 'cursorId'>,
  requestedCursor?: number
): { cursor: number } | undefined {
  const { hasNext, cursorId } = lastPage;

  if (!hasNext || cursorId == null || cursorId === requestedCursor) {
    return undefined;
  }

  return { cursor: cursorId };
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const formatPeriod = (startDate: string, endDate: string) =>
  `${startDate.slice(5).replace('-', '.')} - ${endDate
    .slice(5)
    .replace('-', '.')}`;

/**
 * 스티커 하나를 폴더 장식으로 바꾼다. 상세와 같은 필드를 쓰는데, 목록 응답의 모양을
 * 확인하지 못해서 필요한 필드가 빠졌거나 다른 타입이면 null을 줘서 건너뛴다.
 */
function toDecoration(
  sticker: NonNullable<FriendTravelRecordItem['stickers']>[number] | null
): TravelFolderDecoration | null {
  if (
    !sticker ||
    !isFiniteNumber(sticker.recordStickerId) ||
    !isFiniteNumber(sticker.stickerId) ||
    typeof sticker.imageUrl !== 'string' ||
    sticker.imageUrl === '' ||
    !isFiniteNumber(sticker.positionX) ||
    !isFiniteNumber(sticker.positionY) ||
    !isFiniteNumber(sticker.rotation) ||
    !isFiniteNumber(sticker.scale) ||
    !isFiniteNumber(sticker.zIndex)
  ) {
    return null;
  }

  return {
    id: String(sticker.recordStickerId),
    stickerId: sticker.stickerId,
    imageUrl: sticker.imageUrl,
    x: sticker.positionX,
    y: sticker.positionY,
    rotation: sticker.rotation,
    scale: sticker.scale,
    zIndex: sticker.zIndex,
  };
}

/** previewImages를 imageOrder 순으로, 비면 대표 사진으로, 그래도 없으면 빈 폴더. */
function toFolderPhotos(item: FriendTravelRecordItem): [string, ...string[]] {
  const photos = [...(item.previewImages ?? [])]
    .filter((image) => image?.imageUrl)
    .sort((a, b) => a.imageOrder - b.imageOrder)
    .map((image) => image.imageUrl);

  if (photos.length > 0) {
    return photos as [string, ...string[]];
  }

  // 사진이 없으면 빈 문자열 하나로 두면 카드가 사진 없는 폴더로 그린다.
  return [item.coverImageUrl || ''];
}

/**
 * 친구의 폴더 목록 항목을 폴더 카드용으로 바꾼다. 목록에는 지역 이름과 권한, 버전이
 * 없어서 regionName과 regionCode는 빈 값이고 permissions, version은 넣지 않는다.
 */
export function toFriendTravelFolder(
  item: FriendTravelRecordItem
): TravelRecordFolder {
  const visibility = toTravelRecordVisibility(item.visibility ?? undefined);

  return {
    id: String(item.travelRecordId),
    regionId: item.regionId,
    regionCode: '',
    regionName: '',
    ...(visibility ? { visibility } : {}),
    title: item.title,
    folderTheme: item.folderTheme,
    startDate: item.startDate,
    endDate: item.endDate,
    period: formatPeriod(item.startDate, item.endDate),
    photos: toFolderPhotos(item),
    decorations: (item.stickers ?? []).flatMap((sticker) => {
      const decoration = toDecoration(sticker);

      return decoration ? [decoration] : [];
    }),
  };
}

/** 연도 드롭다운 항목. 유효한 정수 연도만 중복 없이 내림차순으로 둔다. */
export function getFriendRecordYearOptions(
  years: readonly number[] | undefined
): number[] {
  return [
    ...new Set(
      (years ?? []).filter((year) => Number.isInteger(year) && year > 0)
    ),
  ].sort((a, b) => b - a);
}

/**
 * 보여 줄 연도. URL 연도가 목록에 있으면 그 연도, 없으면 올해가 있을 때 올해,
 * 올해도 없으면 가장 최신 연도다. 목록이 비면 null(조회 없이 빈 상태만)이다.
 */
export function resolveFriendRecordYear(
  years: readonly number[],
  urlYear: number | null,
  currentYear: number
): number | null {
  if (urlYear !== null && years.includes(urlYear)) return urlYear;
  if (years.includes(currentYear)) return currentYear;

  return years.length > 0 ? Math.max(...years) : null;
}
