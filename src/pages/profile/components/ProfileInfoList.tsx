import cake from '../../../assets/icons/cake.svg';
import location from '../../../assets/icons/location.svg';
import mail from '../../../assets/icons/mail.svg';

const profileInfo = [
  { icon: mail, label: '이메일', value: '등록된 이메일 정보가 없어요' },
  { icon: location, label: '사는지역', value: '등록된 지역 정보가 없어요' },
  { icon: cake, label: '태어난 연도', value: '등록된 출생 연도 정보가 없어요' },
];

export function ProfileInfoList({
  scale,
  isBusinessProfile = false,
}: {
  scale: number;
  isBusinessProfile?: boolean;
}) {
  // '사는지역'은 가입할 때 고른 거주 지역이다. 사업장 주소를 여기에 넣으면
  // 사업장이 여럿일 때 어느 쪽인지도 알 수 없고 의미도 다르다. 사업장 주소는
  // 아래 '내 사업장' 목록이 이미 보여준다.
  const visibleProfileInfo = isBusinessProfile
    ? profileInfo.slice(0, 2)
    : profileInfo;

  return (
    <div className="w-full overflow-hidden rounded-xl bg-[#f9f9f9]">
      {visibleProfileInfo.map((info) => (
        <ProfileInfoItem key={info.label} {...info} scale={scale} />
      ))}
    </div>
  );
}

function ProfileInfoItem({
  icon,
  label,
  value,
  scale,
}: {
  icon: string;
  label: string;
  value: string;
  scale: number;
}) {
  return (
    <div
      className="flex items-center"
      style={{ gap: 12 * scale, padding: `${16 * scale}px ${20 * scale}px` }}
    >
      <span
        className="flex shrink-0 items-center justify-center rounded-xl bg-[#f1f1f1]"
        style={{ width: 36 * scale, height: 36 * scale }}
      >
        <img
          src={icon}
          alt=""
          aria-hidden="true"
          style={{ width: 24 * scale, height: 24 * scale }}
        />
      </span>
      <div className="flex min-w-0 flex-col" style={{ gap: 2 * scale }}>
        <p
          className="text-[#a1a1a1]"
          style={{ fontSize: 12 * scale, lineHeight: `${14 * scale}px` }}
        >
          {label}
        </p>
        <p
          className="truncate font-semibold text-[#1c1c1c]"
          style={{ fontSize: 16 * scale, lineHeight: `${19 * scale}px` }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
