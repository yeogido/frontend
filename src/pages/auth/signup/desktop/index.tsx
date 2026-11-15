import { useState } from 'react';

import SignupEmailDesktop from './SignupEmailDesktop';
import SignupStartDesktop from './SignupStartDesktop';

/** 회원가입의 데스크톱 뷰 — 방법 선택 후 이메일 가입 폼으로 넘어간다. */
function SignUpDesktopPage() {
  const [step, setStep] = useState<'start' | 'email'>('start');

  return step === 'start' ? (
    <SignupStartDesktop onEmailStart={() => setStep('email')} />
  ) : (
    <SignupEmailDesktop />
  );
}

export default SignUpDesktopPage;
