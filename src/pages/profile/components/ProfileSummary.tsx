import type { UserRole } from '../../../types/user.type';

const ROLE_LABEL: Partial<Record<UserRole, string>> = {
  BUSINESS: '소상공인',
  ADMIN: '관리자',
};

interface ProfileSummaryProps {
  readonly name: string;
  readonly role?: UserRole;
  readonly scale: number;
  readonly onEdit: () => void;
}

export function ProfileSummary({
  name,
  role,
  scale,
  onEdit,
}: ProfileSummaryProps) {
  const roleLabel = role ? ROLE_LABEL[role] : undefined;

  return (
    <>
      <h1
        className="font-semibold text-[#1c1c1c]"
        style={{
          marginTop: 12 * scale,
          fontSize: 24 * scale,
          lineHeight: `${29 * scale}px`,
        }}
      >
        {name}
      </h1>
      {roleLabel ? (
        <p
          className="font-medium text-[#7f7f7f]"
          style={{ fontSize: 16 * scale, lineHeight: `${19 * scale}px` }}
        >
          {roleLabel}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onEdit}
        className="bg-main-5 rounded-lg font-semibold text-[#f9f9f9]"
        style={{
          marginTop: 8 * scale,
          padding: `${8 * scale}px ${12 * scale}px`,
          fontSize: 12 * scale,
          lineHeight: `${14 * scale}px`,
        }}
      >
        프로필 수정
      </button>
    </>
  );
}
