import type { TravelRecordFolder } from '../types';

export interface TravelRecordActionPermissions {
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * 상세 화면의 수정·삭제 가능 여부. 서버 상세의 permissions를 우선하고, 없으면
 * 작성자 본인일 때만 허용한다. 서버 상세가 아직 없으면(로딩 중) 둘 다 막는다.
 * 서버는 변경 요청 때 권한을 다시 검사하므로 이 값은 메뉴 표시용이다.
 */
export function getTravelRecordActionPermissions(
  folder: Pick<TravelRecordFolder, 'permissions' | 'owner'> | undefined,
  userId: number | null
): TravelRecordActionPermissions {
  const isOwner = folder?.owner?.userId === userId && userId !== null;

  return {
    canEdit: folder?.permissions?.canEdit ?? isOwner,
    canDelete: folder?.permissions?.canDelete ?? isOwner,
  };
}
