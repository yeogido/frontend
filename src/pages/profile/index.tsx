import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../components/layout';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useMyBusinesses } from '../../hooks/useMyBusinesses';
import {
  ProfileDetailSection,
  ProfilePhotoEditor,
  ProfileSummary,
  WithdrawalDialog,
} from './components';

function ProfilePage() {
  const scale = useGlobalScale();
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const { data } = useMyBusinesses(isAuthenticated);

  // 인증 사업장이 없으면 빈 배열이 정상 응답이다(404가 아니다).
  // 목록은 businessInfoId 최신순이라 첫 항목이 가장 최근 인증 사업장이다.
  const businesses = data ?? [];
  const primaryBusiness = businesses[0] ?? null;
  const name =
    primaryBusiness?.representativeName ?? (userId ? `회원 #${userId}` : '회원');

  return (
    <ResponsivePageShell
      mode="main-layout"
      bottomPadding={40}
      className="bg-[#f1f1f1]"
    >
      <section
        className="flex flex-col items-center"
        style={{ paddingTop: 32 * scale }}
      >
        <ProfilePhotoEditor scale={scale} />
        <ProfileSummary
          name={name}
          isBusinessProfile={primaryBusiness !== null}
          scale={scale}
          onEdit={() => navigate('/profile/edit')}
        />
        <ProfileDetailSection businesses={businesses} scale={scale} />
        <button
          type="button"
          onClick={() => setIsWithdrawalDialogOpen(true)}
          className="flex w-full items-center justify-center rounded-xl bg-[#e4e4e4] font-semibold text-[#7f7f7f]"
          style={{
            marginTop: 34 * scale,
            height: 52 * scale,
            paddingInline: 10 * scale,
            fontSize: 18 * scale,
            lineHeight: `${21 * scale}px`,
          }}
        >
          회원 탈퇴하기
        </button>
      </section>
      <WithdrawalDialog
        isOpen={isWithdrawalDialogOpen}
        onConfirm={() => {
          setIsWithdrawalDialogOpen(false);
          navigate('/');
        }}
        onCancel={() => setIsWithdrawalDialogOpen(false)}
      />
    </ResponsivePageShell>
  );
}

export default ProfilePage;
