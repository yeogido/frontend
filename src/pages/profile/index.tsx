import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../components/layout';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import {
  BusinessVerificationCard,
  ProfileInfoList,
  ProfilePhotoEditor,
  WithdrawalDialog,
} from './components';

function ProfilePage() {
  const scale = useGlobalScale();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const name = userId ? `회원 #${userId}` : '회원';

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
        <button
          type="button"
          onClick={() => navigate('/profile/edit')}
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
        <div className="w-full" style={{ marginTop: 24 * scale }}>
          <ProfileInfoList scale={scale} />
        </div>
        <div className="w-full" style={{ marginTop: 24 * scale }}>
          <BusinessVerificationCard scale={scale} />
        </div>
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
