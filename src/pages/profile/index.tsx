import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ResponsivePageShell } from '../../components/layout';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useBusinessVerificationStore } from '../../store/businessVerification.store';
import type { BusinessProfile } from '../business-verification/types';
import {
  ProfileDetailSection,
  ProfilePhotoEditor,
  ProfileSummary,
  WithdrawalDialog,
} from './components';

interface ProfilePageProps {
  readonly businessProfileOverride?: BusinessProfile | null;
}

function ProfilePage({ businessProfileOverride }: ProfilePageProps) {
  const scale = useGlobalScale();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const storedBusinessProfile = useBusinessVerificationStore(
    (state) => state.profile
  );
  const businessProfile =
    businessProfileOverride === undefined
      ? storedBusinessProfile
      : businessProfileOverride;
  const name =
    businessProfile?.representativeName ??
    (userId ? `회원 #${userId}` : '회원');

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
          isBusinessProfile={Boolean(businessProfile)}
          scale={scale}
          onEdit={() => navigate('/profile/edit')}
        />
        <ProfileDetailSection businessProfile={businessProfile} scale={scale} />
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
