import { useContext } from 'react';

import {
  LoginModalContext,
  type LoginModalContextValue,
} from '../contexts/LoginModalContext';

export function useLoginModal(): LoginModalContextValue {
  const context = useContext(LoginModalContext);

  if (!context) {
    throw new Error('useLoginModal must be used within LoginModalProvider');
  }

  return context;
}
