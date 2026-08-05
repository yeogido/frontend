// 코스/리뷰 응답의 enum을 화면 문구로 바꾼다.
//
// 백엔드 문서와 실제 응답의 표기가 어긋난 사례가 반복돼(ONE_DAY/MORE vs
// DAY_TRIP/THREE_PLUS, Swagger에 없는 PUBLIC 등) 알려진 별칭을 함께
// 받아들이고, 모르는 값이 와도 화면이 비어 보이지 않게 원문을 그대로
// 돌려준다. enum이 확정되면 별칭만 지우면 된다.

const durationLabels: Record<string, string> = {
  DAY_TRIP: '당일치기',
  ONE_NIGHT: '1박 2일',
  ONE_NIGHT_TWO_DAYS: '1박 2일',
  TWO_NIGHT: '2박 3일',
  TWO_NIGHTS_THREE_DAYS: '2박 3일',
  THREE_NIGHT: '3박 4일',
  THREE_NIGHTS_FOUR_DAYS: '3박 4일',
  THREE_PLUS: '3박 이상',
  FOUR_NIGHTS_OR_MORE: '4박 이상',
};

const transportLabels: Record<string, string> = {
  WALK: '뚜벅이',
  CAR: '자동차',
  PUBLIC: '대중교통',
  PUBLIC_TRANSPORT: '대중교통',
};

const companionLabels: Record<string, string> = {
  SOLO: '혼자',
  ALONE: '혼자',
  FRIEND: '친구와',
  COUPLE: '연인과',
  FAMILY: '가족과',
  CHILDREN: '아이와',
  PET: '반려동물과',
};

// 백엔드 확인 결과 실제 값은 아래 10단계다. 명세서에 있던 TEEN,
// FIFTIES_PLUS는 코드와 맞지 않는 옛 값이라 받지 않는다.
const ageGroupLabels: Record<string, string> = {
  TEENS: '10대',
  TWENTIES: '20대',
  THIRTIES: '30대',
  FORTIES: '40대',
  FIFTIES: '50대',
  SIXTIES: '60대',
  SEVENTIES: '70대',
  EIGHTIES: '80대',
  NINETIES: '90대',
  HUNDRED_PLUS: '100대 이상',
};

// NONE은 성별을 밝히지 않은 사용자다. 라벨을 만들지 않아 작성자 표기에서
// 연령대만 남는다.
const genderLabels: Record<string, string> = {
  MALE: '남',
  FEMALE: '여',
  NONE: '',
};

function toLabel(
  labels: Record<string, string>,
  value: string | undefined
): string | undefined {
  if (!value) return undefined;

  return Object.prototype.hasOwnProperty.call(labels, value)
    ? labels[value]
    : undefined;
}

export function toDurationLabel(durationType: string): string {
  return toLabel(durationLabels, durationType) ?? durationType;
}

export function toTransportLabel(transportType: string): string {
  return toLabel(transportLabels, transportType) ?? transportType;
}

// 이동 수단은 화면에 따라 '뚜벅이'와 '뚜벅이 코스'로 다르게 붙어서, 뒷말을
// 이어 붙일 수 있게 매칭 실패를 구분해 주는 형태도 함께 둔다.
export function findTransportLabel(transportType: string): string | undefined {
  return toLabel(transportLabels, transportType);
}

export function toCompanionLabel(companionType: string): string {
  return toLabel(companionLabels, companionType) ?? companionType;
}

// 연령대/성별은 문장으로 조합돼 노출되므로, 모르는 값은 원문을 흘리지 않고
// 비운다. 'TEEN' 같은 enum이 카드에 그대로 찍히는 편이 더 나쁘다.
export function toAgeGroupLabel(ageGroup: string | undefined): string {
  return toLabel(ageGroupLabels, ageGroup) ?? '';
}

export function toGenderLabel(gender: string | undefined): string {
  return toLabel(genderLabels, gender) ?? '';
}

/**
 * 후기 카드의 작성자 메타 문구("20대 여")를 만든다.
 *
 * 현재 리뷰 조회 응답에는 성별이 없어 연령대만 표시된다. 백엔드가
 * ReviewAuthor에 gender를 추가하면 인자만 넘기면 된다.
 */
export function toReviewerMetaLabel(
  ageGroup: string | undefined,
  gender?: string
): string {
  return [toAgeGroupLabel(ageGroup), toGenderLabel(gender)]
    .filter(Boolean)
    .join(' ');
}
