// react-query나 라우터를 import하지 않는다. 어떤 소상공인 영역을 보일지 정하는
// 판단만 담아 Node 테스트 러너에서 그대로 검증한다.

/** 사업자 인증 화면 경로. */
export const BUSINESS_VERIFICATION_PATH = '/business-verification';

export type ProfileBusinessSectionKind = 'banner' | 'card' | 'none';

interface ProfileBusinessSectionParams {
  readonly role: string | undefined;
  readonly businessCount: number;
  /** 사업장 목록을 처음 받는 중. */
  readonly isLoading: boolean;
  readonly isError: boolean;
}

/**
 * 프로필에 보일 소상공인 영역. 모바일(ProfileDetailSection)과 같은 기준이다.
 * 인증한 사업장이 있으면 "내 사업장" 카드, 없고 일반 회원(USER)이면 인증 배너,
 * 그 외(관리자 등)는 아무것도 보이지 않는다. 목록이 로딩 중이거나 에러일 때는
 * 인증 배너가 잠깐 보였다 사라지는 일이 없도록 아무것도 보이지 않는다.
 */
export function getProfileBusinessSection({
  role,
  businessCount,
  isLoading,
  isError,
}: ProfileBusinessSectionParams): ProfileBusinessSectionKind {
  if (isLoading || isError) return 'none';
  if (businessCount > 0) return 'card';

  return role === 'USER' ? 'banner' : 'none';
}
