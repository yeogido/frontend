import { useState } from 'react';

import {
  SignupForm,
  SignupStart,
} from './components';

function SignUpPage() {
  const [step, setStep] = useState<'start' | 'email'>('start');

  return step === 'start' ? (
    <SignupStart onEmailStart={() => setStep('email')} />
  ) : (
    <SignupForm />
  );
}

export default SignUpPage;
